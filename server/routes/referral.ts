import { Router } from 'express';
import prisma from '../lib/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// Validate referral code (public)
router.get('/validate', async (req, res) => {
  try {
    const code = String(req.query.code || '').toUpperCase().trim();
    if (!/^[A-Z0-9]{6,12}$/.test(code)) {
      return res.json({ valid: false });
    }
    const user = await prisma.user.findUnique({ where: { referralCode: code } });
    res.json({ valid: !!user });
  } catch (e) {
    res.status(500).json({ error: 'Failed to validate code' });
  }
});

// Get referral info
router.get('/', authenticate, async (req: any, res) => {
  try {
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
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

    // Calculate earnings
    const totalReferrals = user.referrals.length;
    const totalEarnings = user.referrals.reduce((sum, ref) => sum + ref.commission, 0);
    const totalPoints = totalReferrals * 500;

    // Determine commission rate
    let commissionRate = 0.25;
    if (totalReferrals >= 10) commissionRate = 0.35;
    else if (totalReferrals >= 5) commissionRate = 0.30;

    res.json({
      referralCode: user.referralCode,
      referralLink: `https://imperiumx.com/?ref=${user.referralCode}`,
      totalReferrals,
      totalEarnings,
      totalPoints,
      commissionRate,
      referrals: user.referrals.map(ref => ({
        username: ref.referred.username,
        email: ref.referred.email,
        commission: ref.commission,
        status: ref.status,
        date: ref.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get referral error:', error);
    res.status(500).json({ error: 'Failed to get referral info' });
  }
});

// Idempotent credit endpoint (optional trigger after purchase)
router.post('/credit', authenticate, async (req: any, res) => {
  try {
    // CEO or staff may call this, or the buyer; logic is idempotent either way
    const purchaseId = String(req.body?.purchaseId || '').trim();
    if (!purchaseId) return res.status(400).json({ error: 'purchaseId required' });
    const order =
      (await prisma.order.findUnique({ where: { id: purchaseId } })) ||
      (await prisma.order.findFirst({ where: { orderId: purchaseId } }));
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const user = await prisma.user.findUnique({ where: { id: order.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.referredBy) return res.json({ status: 'no_referrer' });

    // Already credited?
    const exists = await prisma.referral.findFirst({ where: { referredId: user.id } });
    if (exists) return res.json({ status: 'already_credited' });

    // Determine commission rate by existing count
    const totalReferrals = await prisma.referral.count({ where: { referrerId: user.referredBy } });
    let commissionRate = 0.25;
    if (totalReferrals >= 10) commissionRate = 0.35;
    else if (totalReferrals >= 5) commissionRate = 0.3;
    const commission = (order.amount || 0) * commissionRate;

    await prisma.$transaction(async (tx) => {
      await tx.referral.create({
        data: {
          referrerId: user.referredBy!,
          referredId: user.id,
          commission,
          status: 'completed',
        },
      });
      // +500 points to referrer
      await tx.user.update({
        where: { id: user.referredBy! },
        data: { points: { increment: 500 } },
      });
      await tx.points.upsert({
        where: { userId: user.referredBy! },
        update: { balance: { increment: 500 } },
        create: { userId: user.referredBy!, balance: 500 },
      });
      await tx.pointsTransaction.create({
        data: {
          userId: user.referredBy!,
          delta: 500,
          reason: 'referral_bonus',
          meta: { referredUserId: user.id, orderId: order.orderId, commission },
        },
      });
    });
    res.json({ status: 'credited', commission });
  } catch (e) {
    console.error('Referral credit error:', e);
    res.status(500).json({ error: 'Failed to credit referral' });
  }
});

export default router;
