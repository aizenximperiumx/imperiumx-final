import { Router } from 'express';
import prisma from '../lib/database';
import { authenticate, requireRole } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const createReviewSchema = z.object({
  orderId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

router.post('/', authenticate, async (req: any, res) => {
  try {
    const parse = createReviewSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
    }

    const { userId } = req.user;
    const { orderId, rating, comment } = parse.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed orders can be reviewed' });
    }

    const existing = await prisma.review.findUnique({ where: { orderId } });
    if (existing) {
      return res.status(400).json({ error: 'Order already reviewed' });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        orderId,
        rating,
        comment,
        isPublic: true,
      },
    });

    res.status(201).json({ message: 'Review submitted', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

router.get('/public', async (req: any, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const reviews = await prisma.review.findMany({
      where: { isPublic: true },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true } },
        order: { select: { orderId: true, amount: true } },
      },
    });
    res.json(reviews);
  } catch (error) {
    console.error('Public reviews error:', error);
    res.status(500).json({ error: 'Failed to list public reviews' });
  }
});

router.get('/public/summary', async (req: any, res) => {
  try {
    const counts = await prisma.review.groupBy({
      by: ['rating', 'isPublic'],
      _count: { rating: true },
      where: { isPublic: true },
    });
    const avg = await prisma.review.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
      where: { isPublic: true },
    });
    res.json({
      averageRating: avg._avg.rating || 0,
      totalReviews: avg._count.rating || 0,
      breakdown: counts.reduce((m: any, c: any) => {
        if (!c.isPublic) return m;
        m[c.rating] = c._count.rating;
        return m;
      }, {}),
    });
  } catch (error) {
    console.error('Public summary error:', error);
    res.status(500).json({ error: 'Failed to summarize public reviews' });
  }
});

router.get('/', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const reviews = await prisma.review.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true, email: true } },
        order: { select: { id: true, orderId: true, amount: true } },
      },
    });
    res.json(reviews);
  } catch (error) {
    console.error('List reviews error:', error);
    res.status(500).json({ error: 'Failed to list reviews' });
  }
});

router.patch('/:id/public', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const schema = z.object({ isPublic: z.boolean() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const { id } = req.params;
    const review = await prisma.review.update({
      where: { id },
      data: { isPublic: parsed.data.isPublic },
    });
    res.json({ message: 'Updated', review });
  } catch (error) {
    console.error('Update review visibility error:', error);
    res.status(500).json({ error: 'Failed to update review visibility' });
  }
});

router.get('/summary', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const counts = await prisma.review.groupBy({
      by: ['rating'],
      _count: { rating: true },
    });
    const avg = await prisma.review.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    });
    res.json({
      averageRating: avg._avg.rating || 0,
      totalReviews: avg._count.rating || 0,
      breakdown: counts.reduce((m: any, c: any) => {
        m[c.rating] = c._count.rating;
        return m;
      }, {}),
    });
  } catch (error) {
    console.error('Summary reviews error:', error);
    res.status(500).json({ error: 'Failed to summarize reviews' });
  }
});

export default router;
