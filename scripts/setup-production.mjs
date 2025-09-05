#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { execSync } from 'child_process';

console.log('🚀 Setting up production database...');

try {
  console.log('1️⃣ Pushing database schema...');
  execSync('npx prisma db push --accept-data-loss --force-reset', { stdio: 'inherit' });
  
  console.log('2️⃣ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('3️⃣ Creating admin user...');
  
  const prisma = new PrismaClient();
  
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' }
  });
  
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user' }
  });
  
  // Create admin user
  const adminEmail = 'admin@trampolin.dev';
  const adminPassword = 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Production Admin',
      email: adminEmail,
      passwordHash,
      roleId: adminRole.id,
    }
  });
  
  // Create unlimited subscription
  await prisma.subscription.create({
    data: {
      userId: adminUser.id,
      stripeCustomerId: `admin_${adminUser.id}`,
      stripeSubscriptionId: `admin_sub_${adminUser.id}`,
      status: 'active',
      priceId: 'admin_unlimited',
      monthlyLimit: 999999,
      usedThisMonth: 0,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      trialLimit: 999999,
      trialUsed: 0,
    }
  });
  
  console.log('✅ Production setup complete!');
  console.log('');
  console.log('🔑 Login credentials:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('');
  
  await prisma.$disconnect();
  
} catch (error) {
  console.error('❌ Setup failed:', error);
  process.exit(1);
}