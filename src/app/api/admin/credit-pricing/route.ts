import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    });

    if (!user || user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Calculate dynamic credit pricing based on Gold plan
    const goldPlanPrice = 6900; // $69.00 in cents
    const goldPlanCredits = 2500;
    const creditCostCents = goldPlanPrice / goldPlanCredits; // Cost per credit in cents
    const discountedCreditCost = creditCostCents * 0.5; // 50% discount
    const creditPackSize = 100;
    const creditPackPrice = Math.ceil(discountedCreditCost * creditPackSize); // Price for 100 credits

    return NextResponse.json({
      goldPlanPrice: goldPlanPrice / 100, // Convert to dollars
      goldPlanCredits,
      creditCostCents: Math.round(creditCostCents * 100) / 100, // Round to 2 decimal places
      discountedCreditCost: Math.round(discountedCreditCost * 100) / 100,
      creditPackSize,
      creditPackPrice: creditPackPrice / 100, // Convert to dollars
      creditPackPriceCents: creditPackPrice,
      calculation: {
        normalCostPerCredit: `$${(creditCostCents / 100).toFixed(4)}`,
        discountedCostPerCredit: `$${(discountedCreditCost / 100).toFixed(4)}`,
        savings: '50%'
      }
    });
  } catch (error) {
    console.error('Credit pricing calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate credit pricing' },
      { status: 500 }
    );
  }
}