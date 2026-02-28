import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { connectDB, disconnectDB } from './lib/database';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import ticketRoutes from './routes/tickets';
import userRoutes from './routes/users';
import loyaltyRoutes from './routes/loyalty';
import referralRoutes from './routes/referral';
import reviewRoutes from './routes/reviews';
import profileRoutes from './routes/profile';
import orderRoutes from './routes/orders';
import notificationsRoutes from './routes/notifications';
import analyticsRoutes from './routes/analytics';
import abReportRoutes from './routes/ab-report';
import giftCardRoutes from './routes/giftcards';
import activityRoutes from './routes/activity';
import { rateLimit as customRateLimit } from './middleware/rateLimit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(helmet());
app.use(compression());
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/giftcards', giftCardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/report', abReportRoutes);
app.use('/api/activity', activityRoutes);

// Rate limits
app.use('/api/auth/register', customRateLimit({ windowMs: 5 * 60 * 1000, max: 10 }));
app.use('/api/auth/login', customRateLimit({ windowMs: 5 * 60 * 1000, max: 20 }));
app.use('/api/tickets', customRateLimit({ windowMs: 2 * 60 * 1000, max: 60 }));

const staticDir = path.join(__dirname, 'public');
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

startServer();
