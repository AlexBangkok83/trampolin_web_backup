import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { JWT } from 'next-auth/jwt';

// NOTE: Providers (e.g., Credentials, GitHub, etc.) will be added in later subtasks.
// For now we expose a minimal JWT-only configuration so that the API route exists
// without throwing errors. Subtask 3.2 will inject the Prisma adapter + email/password.

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: { select: { name: true } },
          },
        });
        if (!user?.passwordHash) return null;
        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        const result = {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          role: user.role?.name ?? 'user',
        } satisfies { id: string; email?: string; name?: string; role: string };
        return result;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add initial default role (will be updated once we fetch from DB)
      if (user && !token.role) {
        token.role = (user as { role?: string }).role ?? 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { role?: string }).role = (token as JWT).role as string | undefined;
      }
      return session;
    },
  },
};

// Export NextAuth handler for testing convenience (importing directly in route).
export const handler = NextAuth(authOptions);
