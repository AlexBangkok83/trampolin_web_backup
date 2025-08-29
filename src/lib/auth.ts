import NextAuth, { AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// NOTE: Providers (e.g., Credentials, GitHub, etc.) will be added in later subtasks.
// For now we expose a minimal JWT-only configuration so that the API route exists
// without throwing errors. Subtask 3.2 will inject the Prisma adapter + email/password.

export const authOptions: AuthOptions = {
  providers: [],
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
