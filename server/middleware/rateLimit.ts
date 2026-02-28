import { Request, Response, NextFunction } from 'express';

type Bucket = { count: number; expiresAt: number };
const store = new Map<string, Bucket>();

function keyFor(req: Request, windowMs: number) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const path = req.path;
  return `${ip}:${path}:${Math.floor(Date.now() / windowMs)}`;
}

export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyFor(req, windowMs);
      const now = Date.now();
      let bucket = store.get(key);
      if (!bucket || bucket.expiresAt < now) {
        bucket = { count: 0, expiresAt: now + windowMs };
        store.set(key, bucket);
      }
      bucket.count += 1;
      if (bucket.count > max) {
        return res.status(429).json({ error: 'Too many requests' });
      }
      next();
    } catch {
      next();
    }
  };
}
