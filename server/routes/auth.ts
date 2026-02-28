import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma, { connectDB } from '../lib/database';
import { generateToken, generateReferralCode } from '../lib/utils';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import { logEvent } from '../lib/audit';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const schema = z.object({
      username: z.string().min(3).max(32),
      email: z.string().email(),
      password: z.string().min(6).max(128),
      referralCode: z.string().max(16).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    const { username, email, password, referralCode: providedCode } = parsed.data;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate referral code
    const referralCode = generateReferralCode(username);

    // Resolve referredBy if provided
    let referredBy: string | undefined;
    if (providedCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: providedCode } });
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    const envFlag = process.env.GRAND_REOPENING_PROMO;
    const promoActive = envFlag ? envFlag === 'true' : true;
    const totalUsers = await prisma.user.count();
    let welcomePoints = 100;
    if (promoActive) {
      welcomePoints = 1000;
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'customer',
        points: welcomePoints,
        tier: 'bronze',
        level: 1,
        referralCode,
        referredBy,
      },
    });

    // Create points record
    await prisma.points.create({
      data: {
        userId: user.id,
        balance: welcomePoints,
      },
    });
    await prisma.pointsTransaction.create({
      data: { userId: user.id, delta: welcomePoints, reason: 'welcome_bonus', meta: {} },
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points,
        tier: user.tier,
        level: user.level,
        referralCode: user.referralCode,
      },
    });
    try { await logEvent('user.register', user.id, { referralCode: providedCode || null, welcomePoints }); } catch {}
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const schema = z.object({
      username: z.string().min(3),
      password: z.string().min(6),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const { username, password } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points,
        tier: user.tier,
        level: user.level,
        referralCode: user.referralCode,
      },
    });
    try { await logEvent('user.login', user.id, {}); } catch {}
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        tickets: true,
        orders: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      points: user.points,
      tier: user.tier,
      level: user.level,
      referralCode: user.referralCode,
      tickets: user.tickets,
      orders: user.orders,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
