#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    console.log('🔍 Checking existing users...');
    
    // List all users
    const users = await prisma.user.findMany({
      include: { role: true }
    });
    
    console.log('📋 Existing users:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name}) - Role: ${user.role?.name || 'No role'}`);
    });
    
    // Delete existing admin user if exists
    const adminEmail = 'admin@trampolin.dev';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      await prisma.subscription.deleteMany({ where: { userId: existingAdmin.id } });
      await prisma.user.delete({ where: { id: existingAdmin.id } });
      console.log('🗑️ Deleted existing admin user');
    }
    
    // Ensure admin role exists
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: { name: 'admin' }
    });
    
    // Create fresh admin user with simple password
    const adminPassword = 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    const newAdmin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        passwordHash,
        roleId: adminRole.id,
      }
    });
    
    // Create unlimited subscription
    await prisma.subscription.create({
      data: {
        userId: newAdmin.id,
        stripeCustomerId: `admin_${newAdmin.id}`,
        stripeSubscriptionId: `admin_sub_${newAdmin.id}`,
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
    
    console.log('✅ Created fresh admin user:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   Role: Admin (unlimited credits)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();