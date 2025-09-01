import { NextResponse } from 'next/server';

// Required for dynamic API routes
export const dynamic = 'force-dynamic';

// Mock data for static export
const MOCK_DATA = {
  uploadsByMonth: [
    { month: '2023-01-01T00:00:00.000Z', count: 5 },
    { month: '2023-02-01T00:00:00.000Z', count: 8 },
    { month: '2023-03-01T00:00:00.000Z', count: 12 },
  ],
  rowsByMonth: [
    { month: '2023-01-01T00:00:00.000Z', count: 150 },
    { month: '2023-02-01T00:00:00.000Z', count: 240 },
    { month: '2023-03-01T00:00:00.000Z', count: 360 },
  ],
  fileSizeDistribution: [
    { size_category: 'Small', count: 10 },
    { size_category: 'Medium', count: 5 },
    { size_category: 'Large', count: 2 },
  ],
};

// Type definitions for query results
interface UploadsByMonth {
  month: Date;
  count: bigint;
}

interface RowsByMonth {
  month: Date;
  count: bigint;
}

interface FileSizeDistribution {
  size_category: string;
  count: bigint;
}

interface StatusDistribution {
  status: string;
  count: bigint;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }>;
}

export async function GET() {
  try {
    // For static export, return mock data
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PHASE === 'phase-production-build'
    ) {
      // Process mock data for charts
      const months: string[] = [];
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() - 5); // Last 6 months

      // Generate month labels for the last 6 months
      for (let i = 0; i < 6; i++) {
        const month = new Date(currentDate);
        months.push(month.toLocaleString('default', { month: 'short', year: '2-digit' }));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Process uploads by month
      const uploadsData = MOCK_DATA.uploadsByMonth.map((item) => item.count);
      const rowsData = MOCK_DATA.rowsByMonth.map((item) => item.count);

      const uploadsOverTime: ChartData = {
        labels: months,
        datasets: [
          {
            label: 'Uploads',
            data: uploadsData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          },
        ],
      };

      const rowsOverTime: ChartData = {
        labels: months,
        datasets: [
          {
            label: 'Rows Processed',
            data: rowsData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
          },
        ],
      };

      const fileSizeChartData = {
        labels: MOCK_DATA.fileSizeDistribution.map((item) => item.size_category),
        datasets: [
          {
            label: 'Number of Files',
            data: MOCK_DATA.fileSizeDistribution.map((item) => item.count),
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(245, 158, 11, 0.7)',
            ],
          },
        ],
      };

      return NextResponse.json({
        uploadsOverTime,
        rowsOverTime,
        fileSizeDistribution: fileSizeChartData,
        statusDistribution: {
          labels: ['Completed', 'Processing', 'Failed'],
          datasets: [
            {
              label: 'Status',
              data: [10, 2, 1],
              backgroundColor: [
                'rgba(16, 185, 129, 0.7)',
                'rgba(59, 130, 246, 0.7)',
                'rgba(239, 68, 68, 0.7)',
              ],
            },
          ],
        },
      });
    }

    // For static export, always return mock data
    // Process mock data for charts
    const months: string[] = [];
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 5); // Last 6 months

    // Generate month labels for the last 6 months
    for (let i = 0; i < 6; i++) {
      const month = new Date(currentDate);
      months.push(month.toLocaleString('default', { month: 'short', year: '2-digit' }));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Process uploads by month
    const uploadsData = MOCK_DATA.uploadsByMonth.map((item) => item.count);
    const rowsData = MOCK_DATA.rowsByMonth.map((item) => item.count);

    const uploadsOverTime: ChartData = {
      labels: months,
      datasets: [
        {
          label: 'Uploads',
          data: uploadsData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        },
      ],
    };

    const rowsOverTime: ChartData = {
      labels: months,
      datasets: [
        {
          label: 'Rows Processed',
          data: rowsData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
        },
      ],
    };

    const fileSizeChartData = {
      labels: MOCK_DATA.fileSizeDistribution.map((item) => item.size_category),
      datasets: [
        {
          label: 'Number of Files',
          data: MOCK_DATA.fileSizeDistribution.map((item) => item.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
          ],
        },
      ],
    };

    return NextResponse.json({
      uploadsOverTime,
      rowsOverTime,
      fileSizeDistribution: fileSizeChartData,
      statusDistribution: {
        labels: ['Completed', 'Processing', 'Failed'],
        datasets: [
          {
            label: 'Status',
            data: [10, 2, 1],
            backgroundColor: [
              'rgba(16, 185, 129, 0.7)',
              'rgba(59, 130, 246, 0.7)',
              'rgba(239, 68, 68, 0.7)',
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
