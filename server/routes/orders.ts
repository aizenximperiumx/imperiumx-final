import { Router } from 'express';
import prisma from '../lib/database';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/:id/receipt', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const o =
      (await prisma.order.findUnique({ where: { id }, include: { user: true } })) ||
      (await prisma.order.findFirst({ where: { orderId: id }, include: { user: true } }));
    if (!o) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'ceo' && req.user.role !== 'staff' && req.user.userId !== o.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json({
      orderId: o.orderId,
      amount: o.amount,
      status: o.status,
      paymentMethod: o.paymentMethod || 'crypto',
      createdAt: o.createdAt,
      user: { username: o.user.username, email: o.user.email },
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

export default router;

