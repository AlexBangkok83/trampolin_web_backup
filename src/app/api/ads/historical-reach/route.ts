import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getHistoricalReachForAnalysis } from '@/utils/serverReachUtils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log('🔍 Fetching historical reach data for:', url);

    // Get real historical reach data from the ads database
    const historicalData = await getHistoricalReachForAnalysis(url);

    console.log('📈 Historical data found:', {
      url,
      dataPoints: historicalData.length,
      dateRange:
        historicalData.length > 0
          ? `${historicalData[0].date} to ${historicalData[historicalData.length - 1].date}`
          : 'No data',
    });

    return NextResponse.json({
      success: true,
      data: historicalData,
      url: url,
    });
  } catch (error) {
    console.error('Error fetching historical reach data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch historical reach data',
        data: [],
      },
      { status: 500 },
    );
  }
}
