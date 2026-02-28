import { Router } from 'express';
import prisma from '../lib/database';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const type = String(req.query.type || '').trim();
    const userId = String(req.query.userId || '').trim();
    const where: any = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;
    const items = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load activity' });
  }
});

export default router;
