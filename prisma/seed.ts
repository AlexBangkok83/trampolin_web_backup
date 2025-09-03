import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seed default roles
  const roles = ['admin', 'user'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  // Create admin user
  const adminEmail = 'alex@trampolin.ai';
  const adminPassword = 'TrampolinAdmin2025!'; // Strong password for admin
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  
  if (!adminRole) {
    throw new Error('Admin role not found');
  }

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    // Hash the password
    const passwordHash = await hash(adminPassword, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Alex (Admin)',
        email: adminEmail,
        passwordHash,
        roleId: adminRole.id,
      }
    });

    // Create unlimited subscription for admin
    await prisma.subscription.create({
      data: {
        userId: adminUser.id,
        stripeCustomerId: `admin_${adminUser.id}`, // Fake stripe customer ID
        stripeSubscriptionId: `admin_sub_${adminUser.id}`, // Fake subscription ID
        status: 'active',
        priceId: 'admin_unlimited',
        monthlyLimit: 999999, // Unlimited credits (999,999)
        usedThisMonth: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        trialLimit: 999999, // Unlimited trial
        trialUsed: 0,
      }
    });

    console.log(`✅ Admin user created: ${adminEmail}`);
    console.log(`🔑 Admin password: ${adminPassword}`);
    console.log(`💎 Unlimited credits granted`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
