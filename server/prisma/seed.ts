import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const ceoPassword = await bcrypt.hash('Azsxdccdxsza011!', 10);
  const staff1Password = await bcrypt.hash('xzin123', 10);
  const staff2Password = await bcrypt.hash('Juju123', 10);
  const staff3Password = await bcrypt.hash('anees3232@', 10);

  // Create CEO account
  await prisma.user.upsert({
    where: { username: 'aizen' },
    update: {},
    create: {
      username: 'aizen',
      email: 'ceo@imperiumx.com',
      password: ceoPassword,
      role: 'ceo',
      points: 100,
      tier: 'gold',
      level: 1,
      referralCode: 'AIZEN25',
    },
  });

  // Create Staff accounts
  await prisma.user.upsert({
    where: { username: 'xzin123' },
    update: {},
    create: {
      username: 'xzin123',
      email: 'staff1@imperiumx.com',
      password: staff1Password,
      role: 'staff',
      points: 100,
      tier: 'bronze',
      level: 1,
      referralCode: 'XZIN25',
    },
  });

  await prisma.user.upsert({
    where: { username: 'Juju' },
    update: {},
    create: {
      username: 'Juju',
      email: 'staff2@imperiumx.com',
      password: staff2Password,
      role: 'staff',
      points: 100,
      tier: 'bronze',
      level: 1,
      referralCode: 'JUJU25',
    },
  });

  await prisma.user.upsert({
    where: { username: 'Itzendever' },
    update: {},
    create: {
      username: 'Itzendever',
      email: 'staff3@imperiumx.com',
      password: staff3Password,
      role: 'staff',
      points: 100,
      tier: 'bronze',
      level: 1,
      referralCode: 'ITZEN25',
    },
  });

  console.log('✅ Seed completed - 4 staff accounts created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });