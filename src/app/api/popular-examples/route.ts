import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { formatReach } from '@/utils/reachUtils';
import { getTotalReachForUrl } from '@/utils/serverReachUtils';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get popular URLs from this user's recent analyses
    const recentAnalyses = await prisma.urlAnalysis.findMany({
      where: {
        userId: user.id,
        status: 'completed',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        url: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const examples = await Promise.all(
      recentAnalyses.slice(0, 3).map(async (analysis) => {
        // Use shared utility for consistent reach values
        const cleanUrl = analysis.url
          .trim()
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '');
        const totalReach = await getTotalReachForUrl(cleanUrl);

        return {
          url: cleanUrl,
          originalUrl: analysis.url,
          description: `${formatReach(totalReach)} reach`,
          totalReach,
        };
      }),
    );

    // Filter out examples with no reach and sort by reach
    const validExamples = examples
      .filter((example) => example.totalReach > 0)
      .sort((a, b) => b.totalReach - a.totalReach);

    // If we don't have enough examples, add fallback ones using shared utilities
    if (validExamples.length < 3) {
      const fallbackUrls = [
        'clipia.se/products/clipia',
        'hemmaro.se/products/muslintacke',
        'happified.se/products/glimra-eldlykta',
      ];
      const fallbackExamples = await Promise.all(
        fallbackUrls.map(async (url) => {
          const totalReach = await getTotalReachForUrl(url);
          return {
            url,
            originalUrl: url,
            description: `${formatReach(totalReach)} reach`,
            totalReach,
          };
        }),
      );

      // Add fallback examples to fill up to 3 total
      const needed = 3 - validExamples.length;
      validExamples.push(...fallbackExamples.slice(0, needed));
    }

    return NextResponse.json({
      success: true,
      examples: validExamples.slice(0, 3),
    });
  } catch (error) {
    console.error('Error fetching popular examples:', error);

    // Return fallback examples on error using shared utilities
    const fallbackUrls = [
      'clipia.se/products/clipia',
      'hemmaro.se/products/muslintacke',
      'happified.se/products/glimra-eldlykta',
    ];
    const fallbackExamples = await Promise.all(
      fallbackUrls.map(async (url) => {
        const totalReach = await getTotalReachForUrl(url);
        return {
          url,
          originalUrl: url,
          description: `${formatReach(totalReach)} reach`,
          totalReach,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      examples: fallbackExamples,
    });
  }
}
