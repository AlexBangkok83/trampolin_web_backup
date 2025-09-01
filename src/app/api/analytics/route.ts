import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Authenticate the user
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the last 6 months of data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get uploads count by month for the current user
    const uploadsByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "CsvUpload"
      WHERE "userId" = ${userId}
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    // Get row count by month for the current user
    const rowsByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', u."createdAt") as month,
        COUNT(r.id) as count
      FROM "CsvUpload" u
      LEFT JOIN "CsvRow" r ON u.id = r."uploadId"
      WHERE u."userId" = ${userId}
        AND u."createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', u."createdAt")
      ORDER BY month ASC
    `;

    // Get file size distribution
    const fileSizeDistribution = await prisma.$queryRaw`
      SELECT 
        CASE
          WHEN "fileSize" < 1024 * 1024 THEN 'Small (<1MB)'
          WHEN "fileSize" < 5 * 1024 * 1024 THEN 'Medium (1-5MB)'
          ELSE 'Large (>5MB)'
        END as size_category,
        COUNT(*) as count
      FROM "CsvUpload"
      WHERE "userId" = ${userId}
      GROUP BY size_category
    `;

    // Get upload status distribution
    const statusDistribution = await prisma.$queryRaw`
      SELECT 
        status,
        COUNT(*) as count
      FROM "CsvUpload"
      WHERE "userId" = ${userId}
      GROUP BY status
    `;

    // Format the data for charts
    const months = [];
    const currentDate = new Date(sixMonthsAgo);

    // Generate month labels for the last 6 months
    for (let i = 0; i < 6; i++) {
      const month = new Date(currentDate);
      months.push(month.toLocaleString('default', { month: 'short', year: '2-digit' }));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Process uploads by month
    const uploadsData = Array(6).fill(0);
    (uploadsByMonth as any[]).forEach((item: any) => {
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
    (rowsByMonth as any[]).forEach((item: any) => {
      const month = new Date(item.month).toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      const index = months.indexOf(month);
      if (index !== -1) {
        rowsData[index] = Number(item.count);
      }
    });

    // Process file size distribution
    const fileSizeLabels = (fileSizeDistribution as any[]).map((item: any) => item.size_category);
    const fileSizeData = (fileSizeDistribution as any[]).map((item: any) => Number(item.count));

    // Process status distribution
    const statusLabels = (statusDistribution as any[]).map((item: any) => item.status);
    const statusData = (statusDistribution as any[]).map((item: any) => Number(item.count));

    return NextResponse.json({
      uploadsOverTime: {
        labels: months,
        datasets: [
          {
            label: 'Uploads',
            data: uploadsData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          },
        ],
      },
      rowsOverTime: {
        labels: months,
        datasets: [
          {
            label: 'Rows Processed',
            data: rowsData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
          },
        ],
      },
      fileSizeDistribution: {
        labels: fileSizeLabels,
        datasets: [
          {
            label: 'Number of Files',
            data: fileSizeData,
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(245, 158, 11, 0.7)',
            ],
          },
        ],
      },
      statusDistribution: {
        labels: statusLabels,
        datasets: [
          {
            label: 'Status',
            data: statusData,
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(245, 158, 11, 0.7)',
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
