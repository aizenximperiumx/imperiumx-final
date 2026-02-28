import { Router } from 'express';
import prisma from '../lib/database';
import { authenticate, requireRole } from '../middleware/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { logEvent } from '../lib/audit';

const router = Router();

// Get all users (staff only)
router.get('/', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        points: true,
        tier: true,
        level: true,
        referralCode: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user by ID (staff only)
router.get('/:id', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tickets: true,
        orders: true,
        referrals: {
          include: {
            referred: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user role (CEO only)
router.patch('/:id/role', authenticate, requireRole('ceo'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Adjust user points (staff/CEO)
router.post('/:id/points', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const schema = z.object({
      delta: z.number().int().refine(v => v !== 0, 'delta cannot be zero'),
      reason: z.string().min(1).max(100),
      meta: z.any().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    const { id } = req.params;
    const deltaNum = Number(parsed.data.delta);
    const reasonStr = String(parsed.data.reason);
    const metaVal = parsed.data.meta;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) return { error: 'User not found' } as any;

      await tx.user.update({
        where: { id },
        data: { points: { increment: deltaNum } },
      });

    const p = await tx.points.findUnique({ where: { userId: id } });
    if (p) {
      await tx.points.update({ where: { userId: id }, data: { balance: { increment: deltaNum } } });
    } else {
      const base = Math.max(0, (user.points || 0) + deltaNum);
      await tx.points.create({ data: { userId: id, balance: base } });
    }

      await tx.pointsTransaction.create({
        data: { userId: id, delta: deltaNum, reason: reasonStr, meta: metaVal ?? { by: req.user.userId } },
      });

      const updated = await tx.user.findUnique({ where: { id } });
      return { updatedPoints: updated?.points ?? 0 };
    });

    if ((result as any).error) {
      return res.status(404).json({ error: (result as any).error });
    }

    res.json({ message: 'Points adjusted', points: result.updatedPoints });
  try { await logEvent('admin.points.adjust', req.user.userId, { targetUserId: id, delta: deltaNum, reason: reasonStr }); } catch {}
  } catch (error) {
    console.error('Adjust points error:', error);
    res.status(500).json({ error: 'Failed to adjust points' });
  }
});

// List user point transactions (staff/CEO)
router.get('/:id/points/transactions', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const txs = await prisma.pointsTransaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    res.json(txs);
  } catch (error) {
    console.error('List point tx error:', error);
    res.status(500).json({ error: 'Failed to list transactions' });
  }
});

// Update user profile fields (staff/CEO)
router.patch('/:id', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const schema = z.object({
      username: z.string().min(3).max(32).optional(),
      email: z.string().email().optional(),
      discord: z.string().regex(/^[a-zA-Z0-9._]{2,32}$/).optional(),
    }).refine((v) => v.username !== undefined || v.email !== undefined || v.discord !== undefined, { message: 'No fields to update' });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    const { id } = req.params;
    const data: any = {};
    if (parsed.data.username) data.username = parsed.data.username;
    if (parsed.data.email) data.email = parsed.data.email;
    if (parsed.data.discord) data.discord = parsed.data.discord;
    try {
      const user = await prisma.user.update({ where: { id }, data });
      res.json({ message: 'User updated', user: { id: user.id, username: user.username, email: user.email } });
      try { await logEvent('admin.user.update', req.user.userId, { targetUserId: id, data }); } catch {}
    } catch (e: any) {
      if (e?.code === 'P2002') {
        return res.status(409).json({ error: 'Username or email already in use' });
      }
      throw e;
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Set user password (CEO only)
router.patch('/:id/password', authenticate, requireRole('ceo'), async (req: any, res) => {
  try {
    const schema = z.object({ password: z.string().min(6).max(128) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    const { id } = req.params;
    const hashed = await bcrypt.hash(parsed.data.password, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
    res.json({ message: 'Password updated' });
    try { await logEvent('admin.user.password', req.user.userId, { targetUserId: id }); } catch {}
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Ban user (CEO only)
router.patch('/:id/ban', authenticate, requireRole('ceo'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const reason = String(req.body?.reason || '').trim() || undefined;
    const user = await prisma.user.update({ where: { id }, data: { role: 'banned' } });
    res.json({ message: 'User banned', user: { id: user.id, role: user.role } });
    try { await logEvent('admin.user.ban', req.user.userId, { targetUserId: id, reason }); } catch {}
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// Unban user (CEO only)
router.patch('/:id/unban', authenticate, requireRole('ceo'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const reason = String(req.body?.reason || '').trim() || undefined;
    const user = await prisma.user.update({ where: { id }, data: { role: 'customer' } });
    res.json({ message: 'User unbanned', user: { id: user.id, role: user.role } });
    try { await logEvent('admin.user.unban', req.user.userId, { targetUserId: id, reason }); } catch {}
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

export default router;
