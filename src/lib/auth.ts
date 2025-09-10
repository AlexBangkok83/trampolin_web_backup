import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { JWT } from 'next-auth/jwt';
import { jwtVerify } from 'jose';

// NOTE: Providers (e.g., Credentials, GitHub, etc.) will be added in later subtasks.
// For now we expose a minimal JWT-only configuration so that the API route exists
// without throwing errors. Subtask 3.2 will inject the Prisma adapter + email/password.

/**
 * Configuration options for NextAuth.js.
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' },
      },
      /**
       * Authorizes a user based on email and password credentials.
       * @param credentials - The email and password provided by the user.
       * @returns A user object if authentication is successful, otherwise null.
       */
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
          rememberMe: credentials.rememberMe === 'true',
        } satisfies {
          id: string;
          email?: string;
          name?: string;
          role: string;
          rememberMe: boolean;
        };
        return result;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // Default session max age (1 day)
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    /**
     * Attaches the user's role to the JWT, making it available on the token.
     * This is called when a JWT is created or updated.
     */
    async jwt({ token, user, trigger, session }) {
      // Handle impersonation update
      if (trigger === 'update' && session?.impersonationToken) {
        try {
          const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
          const { payload } = await jwtVerify(session.impersonationToken, secret);

          // Store impersonation data in token
          token.isImpersonating = true;
          token.originalAdminId = payload.adminUserId as string;
          token.originalAdminEmail = payload.adminEmail as string;
          token.sub = payload.targetUserId as string; // Change the user ID
          token.email = payload.targetEmail as string;
          token.name = payload.targetName as string;
          token.role = 'user'; // Impersonated users are treated as regular users
        } catch (error) {
          console.error('Invalid impersonation token:', error);
        }
      }

      // Handle ending impersonation
      if (trigger === 'update' && session?.endImpersonation) {
        if (token.isImpersonating) {
          // Restore original admin session
          token.sub = token.originalAdminId as string;
          token.email = token.originalAdminEmail as string;
          token.name = (token.originalAdminName as string) || (token.originalAdminEmail as string);
          token.role = 'admin';

          // Clear impersonation data
          delete token.isImpersonating;
          delete token.originalAdminId;
          delete token.originalAdminEmail;
          delete token.originalAdminName;
        }
      }

      // Add initial default role (will be updated once we fetch from DB)
      if (user && !token.role) {
        token.role = (user as { role?: string }).role ?? 'user';
        // Store original admin info for impersonation
        if (token.role === 'admin') {
          token.originalAdminName = user.name;
        }
      }

      // Handle remember me functionality - capture it from the account when first signing in
      if (user && 'rememberMe' in user && typeof user.rememberMe !== 'undefined') {
        token.rememberMe = user.rememberMe as boolean;

        // Set custom expiration time based on rememberMe
        if (user.rememberMe) {
          // 30 days for remembered sessions
          const thirtyDays = 30 * 24 * 60 * 60;
          token.exp = Math.floor(Date.now() / 1000) + thirtyDays;
          console.log(
            '🔒 Extended session duration for remember me:',
            new Date((token.exp as number) * 1000),
          );
        } else {
          // 24 hours for regular sessions
          const oneDay = 24 * 60 * 60;
          token.exp = Math.floor(Date.now() / 1000) + oneDay;
        }
      }

      return token;
    },
    /**
     * Extends the session object with the user's role from the JWT.
     * This makes the role available on the `session` object in the client.
     */
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { role?: string }).role = (token as JWT & { role?: string }).role;
        (session.user as { isImpersonating?: boolean }).isImpersonating =
          (token as { isImpersonating?: boolean }).isImpersonating || false;
        (session.user as { originalAdminEmail?: string }).originalAdminEmail = (
          token as { originalAdminEmail?: string }
        ).originalAdminEmail;
        (session.user as { id?: string }).id = (token as JWT).sub as string;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.trampolin.ai' : undefined, // Subdomain cookies in prod only
        secure: process.env.NODE_ENV === 'production',
        // Dynamic maxAge based on remember me - will be overridden per request
        maxAge: 24 * 60 * 60, // Default 24 hours
      },
    },
  },
  // Custom function to handle dynamic session duration based on rememberMe
  events: {
    async signIn({ user }) {
      // If rememberMe is true, we'll extend the session duration
      if ('rememberMe' in user && user.rememberMe) {
        // This extends to 30 days for remembered sessions
        // The actual implementation happens in the JWT callback
        console.log('🔒 Remember Me enabled - extending session duration');
      }
    },
  },
};

// Export NextAuth handler for testing convenience (importing directly in route).
export const handler = NextAuth(authOptions);
