import { Router } from 'express';
import prisma from '../lib/database';
import { authenticate, requireRole } from '../middleware/auth';
import { generateOrderId, verifyToken } from '../lib/utils';
import { z } from 'zod';
import { addTicketClient, broadcastTicket } from '../lib/sse';
import { broadcastUser } from '../lib/notify';
import { logEvent } from '../lib/audit';

const router = Router();

const createTicketSchema = z.object({
  type: z.string().min(1),
  subject: z.string().max(200).optional(),
  description: z.string().min(1).max(5000),
  priority: z.enum(['normal', 'urgent']).optional(),
  lifetimeWarranty: z.boolean().optional(),
});

const confirmPaymentSchema = z.object({
  amount: z.number().nonnegative(),
  paymentMethod: z.enum(['crypto', 'paypal', 'cashapp', 'other']).optional(),
});

// Get all tickets (staff sees all, customers see theirs)
router.get('/', authenticate, async (req: any, res) => {
  try {
    const { role, userId } = req.user;
    const limit = Math.min(parseInt(req.query.limit as string) || 0, 200);
    const offset = parseInt(req.query.offset as string) || 0;

    let tickets;

    if (role === 'ceo' || role === 'staff') {
      const findArgs: any = {
        include: {
          user: {
            select: {
              username: true,
              email: true,
              discord: true,
            },
          },
          assignedUser: {
            select: {
              username: true,
              email: true,
            },
          },
          messages: {
            orderBy: { timestamp: 'asc' },
          },
          order: true,
        },
        orderBy: { createdAt: 'desc' },
      };
      if (limit > 0) {
        findArgs.take = limit;
        findArgs.skip = offset;
      }
      tickets = await prisma.ticket.findMany(findArgs);
    } else {
      const findArgs: any = {
        where: { userId },
        include: {
          assignedUser: {
            select: {
              username: true,
              email: true,
            },
          },
          messages: {
            orderBy: { timestamp: 'asc' },
          },
          order: true,
        },
        orderBy: { createdAt: 'desc' },
      };
      if (limit > 0) {
        findArgs.take = limit;
        findArgs.skip = offset;
      }
      tickets = await prisma.ticket.findMany(findArgs);
    }

    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to get tickets' });
  }
});

// Create new ticket
router.post('/', authenticate, async (req: any, res) => {
  try {
    const parse = createTicketSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
    }
    const { type, subject, description, priority, lifetimeWarranty } = parse.data;
    const { userId } = req.user;

    const ticket = await prisma.ticket.create({
      data: {
        userId,
        type,
        subject,
        description,
        priority: priority || 'normal',
        lifetimeWarranty: lifetimeWarranty || false,
      },
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket,
    });
    try { await logEvent('ticket.create', userId, { ticketId: ticket.id, type, priority: priority || 'normal' }); } catch {}
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get ticket by ID
router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;
    const messagesLimit = Math.min(parseInt(req.query.messagesLimit as string) || 0, 500);

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            tier: true,
            points: true,
            discord: true,
          },
        },
        assignedUser: {
          select: {
            username: true,
            email: true,
          },
        },
        messages: messagesLimit
          ? {
              orderBy: { timestamp: 'asc' },
              take: messagesLimit,
            }
          : {
              orderBy: { timestamp: 'asc' },
            },
        order: { include: { review: true } },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check permissions
    if (role !== 'ceo' && role !== 'staff' && ticket.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to get ticket' });
  }
});

router.get('/:id/stream', async (req: any, res) => {
  try {
    const { id } = req.params;
    const token = String(req.query.token || '');
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).end();
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).end();
    if (decoded.role !== 'ceo' && decoded.role !== 'staff' && decoded.userId !== ticket.userId) {
      return res.status(403).end();
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    (res as any).flushHeaders?.();
    addTicketClient(id, res);
    res.write(`data: ${JSON.stringify({ type: 'hello' })}\n\n`);
  } catch {
    try { res.end(); } catch {}
  }
});

router.post('/:id/deliver', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const schema = z.object({
      username: z.string().optional(),
      password: z.string().optional(),
      email: z.string().optional(),
      notes: z.string().max(2000).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const { id } = req.params;
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const contentLines: string[] = [];
    if (parsed.data.username) contentLines.push(`Username: ${parsed.data.username}`);
    if (parsed.data.password) contentLines.push(`Password: ${parsed.data.password}`);
    if (parsed.data.email) contentLines.push(`Email: ${parsed.data.email}`);
    if (parsed.data.notes) contentLines.push(`Notes: ${parsed.data.notes}`);
    const message = ['Delivery Details', ...contentLines].join('\n');
    const newMessage = await prisma.message.create({
      data: {
        ticketId: id,
        sender: 'staff',
        message,
      },
    });
    broadcastTicket(id, { type: 'delivery', id: newMessage.id });
    res.json({ message: 'Delivered', data: newMessage });
  } catch (e) {
    res.status(500).json({ error: 'Failed to deliver' });
  }
});

// Assign ticket
router.patch('/:id/assign', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const schema = z.object({ userId: z.string().uuid().nullable().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const { id } = req.params;
    const assignedTo = parsed.data.userId || null;
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { assignedTo: assignedTo || undefined },
      include: { assignedUser: { select: { username: true, email: true } } },
    });
    res.json({ message: 'Assigned', ticket });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});

// Create internal note (staff only)
router.post('/:id/notes', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const schema = z.object({ content: z.string().min(1).max(5000) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const { id } = req.params;
    const note = await prisma.ticketNote.create({
      data: {
        ticketId: id,
        authorId: req.user.userId,
        content: parsed.data.content,
      },
    });
    res.status(201).json({ message: 'Note added', note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Get internal notes (staff only)
router.get('/:id/notes', authenticate, requireRole('ceo', 'staff'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const notes = await prisma.ticketNote.findMany({
      where: { ticketId: id },
      include: { author: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

// Send message in ticket
router.post('/:id/messages', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const message = String(req.body?.message || '');
    if (!message || message.length > 5000) {
      return res.status(400).json({ error: 'Invalid message' });
    }
    const { userId, role } = req.user;

    // Verify ticket exists and user has access
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (role !== 'ceo' && role !== 'staff' && ticket.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const newMessage = await prisma.message.create({
      data: {
        ticketId: id,
        sender: role === 'ceo' || role === 'staff' ? 'staff' : 'customer',
        message,
      },
    });

    broadcastTicket(id, { type: 'message', id: newMessage.id });
    // Notify customer when staff sends a message
    if (role === 'ceo' || role === 'staff') {
      if (ticket.userId) {
        broadcastUser(ticket.userId, {
          type: 'message',
          title: 'New message from staff',
          body: message.substring(0, 120),
          url: `/tickets/${id}`,
          timestamp: new Date().toISOString(),
        });
      }
    }
    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark order as paid (customer)
router.post('/:id/order-paid', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    if (role === 'ceo' || role === 'staff') {
      return res.status(403).json({ error: 'Only customers can mark order as paid' });
    }

    const ticket = await prisma.ticket.update({
      where: { id, userId },
      data: { status: 'payment_pending' },
    });

    broadcastTicket(id, { type: 'status', status: 'payment_pending' });
    res.json({
      message: 'Order marked as paid. Waiting for staff confirmation.',
      ticket,
    });
  } catch (error) {
    console.error('Order paid error:', error);
    res.status(500).json({ error: 'Failed to mark order as paid' });
  }
});

// Confirm payment (staff only)
router.post('/:id/payment-confirmed', authenticate, requireRole('ceo'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const parse = confirmPaymentSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
    }
    const { amount, paymentMethod } = parse.data;

    // Generate Order ID
    const orderId = generateOrderId();

    const result = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({ where: { ticketId: id } }).catch(() => null);
      if (existingOrder) {
        const t = await tx.ticket.update({
          where: { id },
          data: { status: 'completed', orderId: existingOrder.orderId },
        });
        return { ticket: t, order: existingOrder, pointsEarned: 0, appliedCredit: 0, netAmount: existingOrder.amount };
      }

      // Update ticket to completed and assign orderId
      const ticket = await tx.ticket.update({
        where: { id },
        data: { status: 'completed', orderId },
      });

      // Calculate available store credit
      const creditTxs = await tx.pointsTransaction.findMany({
        where: {
          userId: ticket.userId,
          OR: [{ reason: 'store_credit_add' }, { reason: 'store_credit_use' }],
        },
        select: { reason: true, meta: true },
      });
      let creditAvail = 0;
      for (const t of creditTxs) {
        const dollars = Number((t as any).meta?.dollars || 0);
        if (t.reason === 'store_credit_add') creditAvail += dollars;
        else if (t.reason === 'store_credit_use') creditAvail -= dollars;
      }
      if (creditAvail < 0) creditAvail = 0;
      const appliedCredit = Math.min(creditAvail, amount || 0);
      const netAmount = Math.max(0, (amount || 0) - appliedCredit);
      if (appliedCredit > 0) {
        await tx.pointsTransaction.create({
          data: {
            userId: ticket.userId,
            delta: 0,
            reason: 'store_credit_use',
            meta: { dollars: appliedCredit, ticketId: id, orderId },
          },
        });
      }

      let order;
      try {
        order = await tx.order.create({
          data: {
            userId: ticket.userId,
            ticketId: id,
            amount: netAmount || 0,
            status: 'completed',
            orderId,
            paymentMethod: paymentMethod || 'crypto',
          },
        });
      } catch (e: any) {
        if (e?.code === 'P2002') {
          const fallback = await tx.order.findUnique({ where: { ticketId: id } });
          if (fallback) {
            return { ticket, order: fallback, pointsEarned: 0, appliedCredit, netAmount };
          }
          throw e;
        }
        throw e;
      }

      // Load user (for tier and referral)
      const user = await tx.user.findUnique({ where: { id: ticket.userId } });
      if (!user) throw new Error('User not found for ticket');

      // Compute tier bonus
      const base = Math.floor((netAmount || 0) * 10);
      const multiplier = user.tier === 'gold' ? 1.25 : user.tier === 'silver' ? 1.1 : 1.0;
      const pointsEarned = Math.floor(base * multiplier);

      // Update user points and optional Points table balance
      await tx.user.update({
        where: { id: user.id },
        data: { points: { increment: pointsEarned } },
      });

      // Update Points.balance if present
      await tx.points.upsert({
        where: { userId: user.id },
        update: { balance: { increment: pointsEarned } },
        create: { userId: user.id, balance: pointsEarned },
      });

      // Insert ledger
      await tx.pointsTransaction.create({
        data: {
          userId: user.id,
          delta: pointsEarned,
          reason: 'order_completed',
          meta: { orderId, amount, tier: user.tier },
        },
      });

      // Update tier thresholds
      const updatedUser = await tx.user.findUnique({ where: { id: user.id } });
      if (updatedUser) {
        let newTier = 'bronze';
        if (updatedUser.points >= 5000) newTier = 'gold';
        else if (updatedUser.points >= 1000) newTier = 'silver';
        if (newTier !== updatedUser.tier) {
          await tx.user.update({ where: { id: user.id }, data: { tier: newTier } });
        }
      }

      // Referral credit on first completed order
      if (user.referredBy) {
        const alreadyReferred = await tx.referral.findFirst({
          where: { referredId: user.id },
        });
        if (!alreadyReferred) {
          // Determine commission rate based on referrer history
          const totalReferrals = await tx.referral.count({
            where: { referrerId: user.referredBy },
          });
          let commissionRate = 0.25;
          if (totalReferrals >= 10) commissionRate = 0.35;
          else if (totalReferrals >= 5) commissionRate = 0.3;
          const commission = (amount || 0) * commissionRate;

          await tx.referral.create({
            data: {
              referrerId: user.referredBy,
              referredId: user.id,
              commission,
              status: 'completed',
            },
          });

          // +500 points to referrer
          await tx.user.update({
            where: { id: user.referredBy },
            data: { points: { increment: 500 } },
          });
          await tx.points.upsert({
            where: { userId: user.referredBy },
            update: { balance: { increment: 500 } },
            create: { userId: user.referredBy, balance: 500 },
          });
          await tx.pointsTransaction.create({
            data: {
              userId: user.referredBy,
              delta: 500,
              reason: 'referral_bonus',
              meta: { referredUserId: user.id, orderId, commission },
            },
          });
        }
      }

      return { ticket, order, pointsEarned, appliedCredit, netAmount };
    });

    broadcastTicket(id, { type: 'status', status: 'completed', orderId });
    // User-level notifications
    try {
      const userId = result.ticket.userId;
      broadcastUser(userId, {
        type: 'order',
        title: 'Order completed',
        body: `Order ${orderId} • $${amount.toFixed(2)}`,
        url: `/tickets/${id}`,
        timestamp: new Date().toISOString(),
      });
      if (result.pointsEarned > 0) {
        broadcastUser(userId, {
          type: 'points',
          title: 'Points added',
          body: `+${result.pointsEarned} points`,
          url: `/profile`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {}
    res.json({
      message: 'Payment confirmed. Order ID: ' + orderId,
      orderId,
      pointsEarned: result.pointsEarned,
      ticket: result.ticket,
      order: result.order,
      appliedCredit: result.appliedCredit,
      netAmount: result.netAmount,
    });
    try { await logEvent('order.completed', result.ticket.userId, { orderId, amount, points: result.pointsEarned }); } catch {}
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Close ticket (staff only)
router.post('/:id/close', authenticate, requireRole('ceo'), async (req: any, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status: 'closed' },
    });

    broadcastTicket(id, { type: 'status', status: 'closed' });
    res.json({
      message: 'Ticket closed successfully',
      ticket,
    });
  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({ error: 'Failed to close ticket' });
  }
});

export default router;
