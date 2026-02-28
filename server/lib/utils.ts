import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export function generateOrderId(): string {
  return 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function generateReferralCode(username: string): string {
  return username.toUpperCase().substring(0, 4) + Math.floor(Math.random() * 1000);
}

export function generateGiftCardCode(): string {
  return 'GC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}
