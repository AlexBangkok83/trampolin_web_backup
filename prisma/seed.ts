import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';

  console.log(`🌱 Seeding ${isProduction ? 'production' : 'development'} database...`);

  // Seed default roles
  const roles = ['admin', 'user'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const userRole = await prisma.role.findUnique({ where: { name: 'user' } });

  if (!adminRole || !userRole) {
    throw new Error('Required roles not found');
  }

  // Production: Create only essential admin user
  if (isProduction) {
    const adminEmail = 'admin@trampolin.dev';
    const adminPassword = 'admin123';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const passwordHash = await hash(adminPassword, 12);

      const adminUser = await prisma.user.create({
        data: {
          name: 'Production Admin',
          email: adminEmail,
          passwordHash,
          roleId: adminRole.id,
        },
      });

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
        },
      });

      console.log(`✅ Production admin created: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
    } else {
      console.log(`ℹ️  Production admin already exists: ${adminEmail}`);
    }
  } else {
    // Development: Create admin + sample users for testing
    const adminEmail = 'admin@trampolin.dev';
    const adminPassword = 'admin123';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const passwordHash = await hash(adminPassword, 12);

      const adminUser = await prisma.user.create({
        data: {
          name: 'Development Admin',
          email: adminEmail,
          passwordHash,
          roleId: adminRole.id,
        },
      });

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
        },
      });

      console.log(`✅ Development admin created: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
    }

    // Create sample test users for development
    const sampleUsers = [{ name: 'Test User', email: 'test@example.com', password: 'test123' }];

    for (const userData of sampleUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!existing) {
        const passwordHash = await hash(userData.password, 12);
        const user = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            passwordHash,
            roleId: userRole.id,
          },
        });

        await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeCustomerId: `test_${user.id}`,
            stripeSubscriptionId: `test_sub_${user.id}`,
            status: 'active',
            priceId: 'test_plan',
            monthlyLimit: 100,
            usedThisMonth: 0,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            trialLimit: 10,
            trialUsed: 0,
          },
        });

        console.log(`✅ Test user created: ${userData.email}`);
      }
    }
  }

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
