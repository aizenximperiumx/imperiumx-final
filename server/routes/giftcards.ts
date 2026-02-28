import { Router } from 'express';
import prisma from '../lib/database';
import { authenticate, requireRole } from '../middleware/auth';
import { z } from 'zod';
import { logEvent } from '../lib/audit';

const router = Router();

// CEO: generate a gift card code
router.post('/generate', authenticate, requireRole('ceo'), async (req: any, res) => {
  try {
    const schema = z.object({ amount: z.number().positive().max(100000) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
    const amount = parsed.data.amount;

    // generate unique code
    let code = '';
    for (let i = 0; i < 5; i++) {
      code = 'GC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const exists = await prisma.giftCard.findUnique({ where: { code } });
      if (!exists) break;
    }
    if (!code) return res.status(500).json({ error: 'Could not generate code' });

    const card = await prisma.giftCard.create({
      data: { code, balance: amount, createdBy: req.user.userId },
    });

    res.status(201).json({ message: 'Gift card generated', code: card.code, amount: card.balance });
    try { await logEvent('giftcard.generate', req.user.userId, { code: card.code, amount }); } catch {}
  } catch (e) {
    console.error('Generate gift card error:', e);
    res.status(500).json({ error: 'Failed to generate gift card' });
  }
});

// Customer: redeem a code (auto-verification)
router.post('/redeem', authenticate, async (req: any, res) => {
  try {
    const schema = z.object({ code: z.string().min(4).max(64) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid code' });
    const input = parsed.data.code.trim().toUpperCase();

    const result = await prisma.$transaction(async (tx) => {
      const card = await tx.giftCard.findUnique({ where: { code: input } });
      if (!card || !card.isActive || card.redeemedBy) {
        throw new Error('Invalid or already redeemed code');
      }
      await tx.giftCard.update({
        where: { code: input },
        data: { isActive: false, redeemedBy: req.user.userId },
      });

      const points = Math.floor(card.balance * 10);
      await tx.user.update({
        where: { id: req.user.userId },
        data: { points: { increment: points } },
      });
      await tx.points.upsert({
        where: { userId: req.user.userId },
        update: { balance: { increment: points } },
        create: { userId: req.user.userId, balance: points },
      });
      await tx.pointsTransaction.create({
        data: { userId: req.user.userId, delta: points, reason: 'gift_card_redeem', meta: { code: input, amount: card.balance } },
      });
      return { amount: card.balance, points };
    });

    res.json({ message: 'Code redeemed', amount: result.amount, pointsAdded: result.points });
    try { await logEvent('giftcard.redeem', req.user.userId, { amount: result.amount, points: result.points, code: input }); } catch {}
  } catch (e: any) {
    console.error('Redeem gift card error:', e);
    res.status(400).json({ error: e.message || 'Failed to redeem code' });
  }
});

// CEO: list gift cards
router.get('/', authenticate, requireRole('ceo'), async (req: any, res) => {
  try {
    const cards = await prisma.giftCard.findMany({
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { username: true } }, redeemer: { select: { username: true } } },
      take: 200,
    });
    res.json(cards);
  } catch (e) {
    console.error('List gift cards error:', e);
    res.status(500).json({ error: 'Failed to list gift cards' });
  }
});

export default router;
