import { Router } from 'express';
import prisma from '../lib/database';
import { authenticate } from '../middleware/auth';
import { addUserClient } from '../lib/notify';
import { verifyToken } from '../lib/utils';

const router = Router();

router.get('/', authenticate, async (req: any, res) => {
  try {
    const { userId } = req.user;
    const messages = await prisma.message.findMany({
      where: { ticket: { userId }, sender: 'staff' },
      include: { ticket: { select: { id: true, orderId: true } } },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const points = await prisma.pointsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const events: Array<{ type: string; title: string; body: string; timestamp: string; url?: string }> = [];
    for (const m of messages) {
      events.push({
        type: 'message',
        title: 'New message from staff',
        body: m.message.substring(0, 120),
        url: `/tickets/${m.ticket.id}`,
        timestamp: m.timestamp.toISOString(),
      });
    }
    for (const o of orders) {
      events.push({
        type: 'order',
        title: 'Order completed',
        body: `Order ${o.orderId} • $${o.amount.toFixed(2)}`,
        timestamp: o.createdAt.toISOString(),
      });
    }
    for (const p of points) {
      events.push({
        type: 'points',
        title: p.delta >= 0 ? 'Points added' : 'Points deducted',
        body: `${p.delta >= 0 ? '+' : ''}${p.delta} points`,
        timestamp: p.createdAt.toISOString(),
      });
    }
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(events.slice(0, 20));
  } catch (e) {
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

export default router;

// SSE stream for notifications
router.get('/stream', async (req: any, res) => {
  try {
    const token = String(req.query.token || '');
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).end();
    const { userId } = decoded;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    (res as any).flushHeaders?.();
    addUserClient(userId, res);
    // warm with recent events
    const messages = await prisma.message.findMany({
      where: { ticket: { userId }, sender: 'staff' },
      include: { ticket: { select: { id: true, orderId: true } } },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });
    for (const m of messages) {
      res.write(`data: ${JSON.stringify({ type: 'message', title: 'New message from staff', body: m.message.substring(0, 120), timestamp: m.timestamp.toISOString() })}\n\n`);
    }
  } catch {
    try { res.end(); } catch {}
  }
});
