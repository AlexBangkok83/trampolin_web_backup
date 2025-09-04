import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { triggerWelcomeEmail } from '@/lib/email-triggers';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parse = bodySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(
        { message: parse.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    const { email, password } = parse.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    // Trigger welcome email asynchronously (don't block registration)
    triggerWelcomeEmail(user.id).catch((error) => {
      console.error('Failed to send welcome email:', error);
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
