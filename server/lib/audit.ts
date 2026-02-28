import prisma from '../lib/database';

export async function logEvent(type: string, userId?: string, meta?: any) {
  try {
    await prisma.auditLog.create({
      data: {
        type,
        userId: userId || null,
        meta: meta || {},
      },
    });
  } catch {}
}
