import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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
    // Authenticate the user
    const user = await currentUser();
    if (!user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the last 6 months of data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get uploads count by month for the current user
    const uploadsByMonth = await prisma.$queryRaw<UploadsByMonth[]>`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*)::bigint as count
      FROM "CsvUpload"
      WHERE "userId" = ${user.id}
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    // Get row count by month for the current user
    const rowsByMonth = await prisma.$queryRaw<RowsByMonth[]>`
      SELECT 
        DATE_TRUNC('month', u."createdAt") as month,
        COUNT(r.id)::bigint as count
      FROM "CsvUpload" u
      LEFT JOIN "CsvRow" r ON u.id = r."uploadId"
      WHERE u."userId" = ${user.id}
        AND u."createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', u."createdAt")
      ORDER BY month ASC
    `;

    // Get file size distribution
    const fileSizeDistribution = await prisma.$queryRaw<FileSizeDistribution[]>`
      SELECT 
        CASE
          WHEN "fileSize" < 1024 * 1024 THEN 'Small (<1MB)'
          WHEN "fileSize" < 5 * 1024 * 1024 THEN 'Medium (1-5MB)'
          ELSE 'Large (>5MB)'
        END as size_category,
        COUNT(*)::bigint as count
      FROM "CsvUpload"
      WHERE "userId" = ${user.id}
      GROUP BY size_category
    `;

    // Get upload status distribution
    const statusDistribution = await prisma.$queryRaw<StatusDistribution[]>`
      SELECT 
        status,
        COUNT(*)::bigint as count
      FROM "CsvUpload"
      WHERE "userId" = ${user.id}
      GROUP BY status
    `;

    // Format the data for charts
    const months: string[] = [];
    const currentDate = new Date(sixMonthsAgo);

    // Generate month labels for the last 6 months
    for (let i = 0; i < 6; i++) {
      const month = new Date(currentDate);
      months.push(month.toLocaleString('default', { month: 'short', year: '2-digit' }));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Process uploads by month
    const uploadsData = Array(6).fill(0);
    uploadsByMonth.forEach((item) => {
      const month = new Date(item.month).toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      const index = months.indexOf(month);
      if (index !== -1) {
        uploadsData[index] = Number(item.count);
      }
    });

    // Process rows by month
    const rowsData = Array(6).fill(0);
    rowsByMonth.forEach((item) => {
      const month = new Date(item.month).toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      const index = months.indexOf(month);
      if (index !== -1) {
        rowsData[index] = Number(item.count);
      }
    });

    // File size and status data are now processed directly in the chart data preparation

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

    // Prepare file size distribution data
    const fileSizeChartData = {
      labels: fileSizeDistribution.map((item) => item.size_category),
      datasets: [
        {
          label: 'Number of Files',
          data: fileSizeDistribution.map((item) => Number(item.count)),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
          ],
        },
      ],
    };

    // Prepare status distribution data
    const statusChartData = {
      labels: statusDistribution.map((item) => item.status),
      datasets: [
        {
          label: 'Status',
          data: statusDistribution.map((item) => Number(item.count)),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
        },
      ],
    };

    return NextResponse.json({
      uploadsOverTime,
      rowsOverTime,
      fileSizeDistribution: fileSizeChartData,
      statusDistribution: statusChartData,
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
