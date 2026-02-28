import { Router } from 'express';
import prisma from '../lib/database';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('ceo'), async (req: any, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const type = String(req.query.type || '').trim();
    const userId = String(req.query.userId || '').trim();
    const where: any = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    const ids = new Set<string>();
    for (const l of logs) {
      if (l.userId) ids.add(l.userId);
      const m: any = l.meta || {};
      ['targetUserId', 'referrerId', 'referredId', 'userId'].forEach(k => {
        const v = m?.[k];
        if (typeof v === 'string' && v.length) ids.add(v);
      });
    }
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(ids) } },
      select: { id: true, username: true, role: true, email: true },
    });
    const byId = new Map(users.map(u => [u.id, u]));
    const items = logs.map(l => {
      const m: any = l.meta || {};
      const actor = l.userId ? byId.get(l.userId) : null;
      const target = m.targetUserId ? byId.get(m.targetUserId) : null;
      const referred = m.referredId ? byId.get(m.referredId) : null;
      const referrer = m.referrerId ? byId.get(m.referrerId) : null;
      let message = '';
      switch (l.type) {
        case 'user.register':
          message = `New user: ${target?.username || m.username || ''} (${m.email || ''})`;
          break;
        case 'user.login':
          message = `Login: ${actor?.username || ''}`;
          break;
        case 'ticket.create':
          message = `Ticket created by ${actor?.username || ''} • ${m.type}`;
          break;
        case 'order.completed':
          message = `Order ${m.orderId} • $${Number(m.amount || 0).toFixed(2)} • user ${actor?.username || ''}`;
          break;
        case 'admin.user.update':
          message = `Staff ${actor?.username || ''} updated ${target?.username || ''}`;
          break;
        case 'admin.user.password':
          message = `CEO ${actor?.username || ''} set password for ${target?.username || ''}`;
          break;
        case 'admin.user.ban':
          message = `CEO ${actor?.username || ''} banned ${target?.username || ''}`;
          break;
        case 'admin.user.unban':
          message = `CEO ${actor?.username || ''} unbanned ${target?.username || ''}`;
          break;
        case 'loyalty.redeem':
          message = `Redeem by ${actor?.username || ''} • ${m.points} pts = $${Number(m.discount || 0).toFixed(2)}`;
          break;
        case 'referral.credit':
          message = `Referral credited • ${referrer?.username || ''} ← ${referred?.username || ''} • $${Number(m.commission || 0).toFixed(2)}`;
          break;
        case 'giftcard.generate':
          message = `Gift card ${m.code} • $${Number(m.amount || 0).toFixed(2)} by ${actor?.username || ''}`;
          break;
        case 'giftcard.redeem':
          message = `Redeemed card ${m.code} by ${actor?.username || ''} • +${m.points} pts`;
          break;
        default:
          message = l.type;
      }
      return {
        id: l.id,
        type: l.type,
        createdAt: l.createdAt,
        actor: actor ? { id: actor.id, username: actor.username, role: actor.role } : null,
        message,
      };
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load activity' });
  }
});

export default router;
