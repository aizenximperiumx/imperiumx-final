import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma, { connectDB } from '../lib/database';
import { generateToken, generateReferralCode } from '../lib/utils';
import { authenticate, requireRole } from '../middleware/auth';
import { z } from 'zod';
import { logEvent } from '../lib/audit';
import { sendMail } from '../lib/mail';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const schema = z.object({
      username: z.string().min(3).max(32),
      email: z.string().email(),
      password: z.string().min(6).max(128),
      referralCode: z.string().max(16).optional(),
      discord: z.string().min(2).max(32).regex(/^[a-zA-Z0-9._]+$/),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    const { username, email, password, referralCode: providedCode, discord } = parsed.data;

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

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 60 * 60 * 1000);
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
        discord,
        emailVerified: false,
        verificationCode: code,
        verificationExpires: expires,
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
    try {
      const html = `<div style="font-family:Arial;padding:16px">
        <h2>Verify your email</h2>
        <p>Your code: <strong>${code}</strong></p>
        <p>The code expires in 60 minutes.</p>
      </div>`;
      await sendMail(user.email, 'ImperiumX: Email Verification Code', html);
    } catch {}
    res.status(201).json({ status: 'verification_required' });
    try { await logEvent('user.register', user.id, { referralCode: providedCode || null, welcomePoints, discord }); } catch {}
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

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Email not verified' });
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

router.post('/verify', async (req, res) => {
  try {
    const schema = z.object({ email: z.string().email(), code: z.string().min(4).max(10) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
    const { email, code } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.emailVerified) {
      const token = generateToken(user.id, user.role);
      return res.json({ message: 'Already verified', token, user: {
        id: user.id, username: user.username, email: user.email, role: user.role,
        points: user.points, tier: user.tier, level: user.level, referralCode: user.referralCode, discord: user.discord,
      } });
    }
    const valid = user.verificationCode === code && user.verificationExpires && new Date(user.verificationExpires).getTime() > Date.now();
    if (!valid) return res.status(400).json({ error: 'Invalid or expired code' });
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationCode: null, verificationExpires: null },
    });
    const token = generateToken(updated.id, updated.role);
    try { await logEvent('user.verify', updated.id, {}); } catch {}
    res.json({
      message: 'Email verified',
      token,
      user: {
        id: updated.id, username: updated.username, email: updated.email, role: updated.role,
        points: updated.points, tier: updated.tier, level: updated.level, referralCode: updated.referralCode, discord: updated.discord,
      },
    });
  } catch (e) {
    res.status(500).json({ error: 'Verification failed' });
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
      discord: user.discord,
      tickets: user.tickets,
      orders: user.orders,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// CEO: impersonate a user, return a token
router.post('/impersonate/:id', authenticate, requireRole('ceo'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const token = generateToken(user.id, user.role);
    try { await logEvent('admin.impersonate', req.user.userId, { targetUserId: id }); } catch {}
    res.json({ token, user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      points: user.points,
      tier: user.tier,
      level: user.level,
      referralCode: user.referralCode,
      discord: user.discord,
    } });
  } catch (e) {
    res.status(500).json({ error: 'Failed to impersonate' });
  }
});

export default router;
