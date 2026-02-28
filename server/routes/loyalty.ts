import { Router } from 'express';
import prisma from '../lib/database';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import { broadcastUser } from '../lib/notify';
import { logEvent } from '../lib/audit';

const router = Router();

// Get user loyalty info
router.get('/', authenticate, async (req: any, res) => {
  try {
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          select: {
            amount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate next tier
    let nextTier = 'silver';
    let pointsToNextTier = 1000 - user.points;

    if (user.tier === 'silver') {
      nextTier = 'gold';
      pointsToNextTier = 5000 - user.points;
    } else if (user.tier === 'gold') {
      nextTier = 'gold';
      pointsToNextTier = 0;
    }

    const totalSpent = user.orders.reduce((sum: number, order: any) => sum + order.amount, 0);

    res.json({
      points: user.points,
      tier: user.tier,
      level: user.level,
      nextTier,
      pointsToNextTier: Math.max(0, pointsToNextTier),
      totalSpent,
      orders: user.orders.length,
    });
  } catch (error) {
    console.error('Get loyalty error:', error);
    res.status(500).json({ error: 'Failed to get loyalty info' });
  }
});

// Redeem points
router.post('/redeem', authenticate, async (req: any, res) => {
  try {
    const { userId } = req.user;
    const schema = z.object({ points: z.number().int().positive() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    const { points } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.points < points) {
        return { error: 'Insufficient points' } as any;
      }

      if (points < 500) {
        return { error: 'Minimum redemption is 500 points' } as any;
      }

      const discount = points / 100; // 100 points = $1

      await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: points } },
      });

      await tx.points.upsert({
        where: { userId },
        update: { balance: { decrement: points } },
        create: { userId, balance: 0 },
      });

      await tx.pointsTransaction.create({
        data: {
          userId,
          delta: -points,
          reason: 'redeem',
          meta: { discount },
        },
      });
      await tx.pointsTransaction.create({
        data: {
          userId,
          delta: 0,
          reason: 'store_credit_add',
          meta: { dollars: discount },
        },
      });

      const updated = await tx.user.findUnique({ where: { id: userId } });
      return { discount, remainingPoints: updated?.points ?? 0 };
    });

    if ((result as any).error) {
      return res.status(400).json({ error: (result as any).error });
    }

    res.json({
      message: 'Points redeemed successfully',
      discount: result.discount,
      remainingPoints: result.remainingPoints,
    });
    try { await logEvent('loyalty.redeem', req.user.userId, { points: parsed.data.points, discount: result.discount }); } catch {}
    try {
      broadcastUser(req.user.userId, {
        type: 'points',
        title: 'Store credit added',
        body: `+$${result.discount.toFixed(2)} credit`,
        url: `/profile`,
        timestamp: new Date().toISOString(),
      });
    } catch {}
  } catch (error) {
    console.error('Redeem points error:', error);
    res.status(500).json({ error: 'Failed to redeem points' });
  }
});

router.get('/credit', authenticate, async (req: any, res) => {
  try {
    const { userId } = req.user;
    const txs = await prisma.pointsTransaction.findMany({
      where: { userId, OR: [{ reason: 'store_credit_add' }, { reason: 'store_credit_use' }] },
      orderBy: { createdAt: 'asc' },
      select: { reason: true, meta: true },
    });
    let credit = 0;
    for (const t of txs) {
      const dollars = Number((t as any).meta?.dollars || 0);
      if (t.reason === 'store_credit_add') credit += dollars;
      else if (t.reason === 'store_credit_use') credit -= dollars;
    }
    if (credit < 0) credit = 0;
    res.json({ credit });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load credit' });
  }
});

// CEO: list all points transactions
router.get('/transactions/all', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ceo') return res.status(403).json({ error: 'Insufficient permissions' });
    const limit = Math.min(parseInt(req.query.limit as string) || 200, 500);
    const offset = parseInt(req.query.offset as string) || 0;
    const txs = await prisma.pointsTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    const ids = Array.from(new Set(txs.map(t => t.userId)));
    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, username: true, email: true, role: true, discord: true },
    });
    const byId = new Map(users.map(u => [u.id, u]));
    const items = txs.map(t => ({
      id: t.id,
      user: byId.get(t.userId),
      delta: t.delta,
      reason: t.reason,
      meta: t.meta,
      createdAt: t.createdAt,
    }));
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load transactions' });
  }
});

export default router;
