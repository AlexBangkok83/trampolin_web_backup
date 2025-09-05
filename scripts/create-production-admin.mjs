#!/usr/bin/env node

/**
 * Production Admin User Creation Script
 * 
 * This script safely creates an admin user in production.
 * Run this script ONLY on production server with proper DATABASE_URL set.
 * 
 * Usage: node scripts/create-production-admin.mjs
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createProductionAdmin() {
  try {
    console.log('🚀 Creating production admin user...');
    
    // Ensure we're in production environment
    if (process.env.NODE_ENV !== 'production' && !process.env.FORCE_PRODUCTION_SEED) {
      console.log('⚠️  This script should only be run in production environment.');
      console.log('   Set FORCE_PRODUCTION_SEED=true to override for testing.');
      process.exit(1);
    }

    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is required');
      process.exit(1);
    }

    // Seed default roles first
    console.log('📝 Creating roles...');
    const roles = ['admin', 'user'];
    for (const roleName of roles) {
      await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });
      console.log(`   ✅ Role: ${roleName}`);
    }

    // Admin user details
    const adminEmail = 'alex@trampolin.ai';
    const adminPassword = 'TrampolinAdmin2025!';
    
    console.log('👤 Creating admin user...');
    
    // Get admin role
    const adminRole = await prisma.role.findUnique({ 
      where: { name: 'admin' } 
    });
    
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
      console.log('   Checking subscription status...');
      
      // Check if subscription exists
      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId: existingAdmin.id }
      });
      
      if (!existingSubscription) {
        console.log('   Creating unlimited subscription...');
        await prisma.subscription.create({
          data: {
            userId: existingAdmin.id,
            stripeCustomerId: `admin_${existingAdmin.id}`,
            stripeSubscriptionId: `admin_sub_${existingAdmin.id}`,
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
        console.log('   ✅ Unlimited subscription created');
      } else {
        console.log('   ✅ Subscription already exists');
      }
      
      return;
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Alex (Admin)',
        email: adminEmail,
        passwordHash,
        roleId: adminRole.id,
      }
    });
    
    console.log(`   ✅ Admin user created: ${adminEmail}`);

    // Create unlimited subscription for admin
    console.log('💎 Creating unlimited subscription...');
    await prisma.subscription.create({
      data: {
        userId: adminUser.id,
        stripeCustomerId: `admin_${adminUser.id}`,
        stripeSubscriptionId: `admin_sub_${adminUser.id}`,
        status: 'active',
        priceId: 'admin_unlimited',
        monthlyLimit: 999999, // Unlimited credits
        usedThisMonth: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        trialLimit: 999999, // Unlimited trial
        trialUsed: 0,
      }
    });

    console.log('🎉 Production admin setup complete!');
    console.log('');
    console.log('📋 Login Details:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   Role: Admin (unlimited credits)');
    console.log('');
    console.log('🔒 SECURITY NOTE: Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating production admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createProductionAdmin();