import { Router } from 'express';
import prisma from '../lib/database';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: any, res) => {
  try {
    const { userId } = req.user;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        points: true,
        tier: true,
        createdAt: true,
      },
    });
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, orderId: true, amount: true, status: true, createdAt: true },
    });
    const transactions = await prisma.pointsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, delta: true, reason: true, meta: true, createdAt: true },
    });
    res.json({ user, orders, transactions });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

export default router;

