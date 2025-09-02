import { PrismaClient } from '@prisma/client';

// Ensure a single PrismaClient instance across the app.
// In Next.js (especially dev with hot-reload) new copies of modules can be loaded,
// so we store the client on the global object in development.

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export { prisma };
