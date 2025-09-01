import { prisma } from './prisma';
import { CsvRow } from './csv-parser';

export interface StorageResult {
  uploadId: string;
  totalRows: number;
  validRows: number;
}

export async function storeCsvData(
  data: CsvRow[],
  userEmail: string,
  filename: string,
): Promise<StorageResult> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Extract headers from first row
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  // Create CSV upload record
  const csvUpload = await prisma.csvUpload.create({
    data: {
      userId: user.id,
      filename: generateUniqueFilename(filename),
      originalName: filename,
      fileSize: Buffer.byteLength(JSON.stringify(data)),
      status: 'processing',
      totalRows: data.length,
      validRows: data.length,
      headers: headers,
    },
  });

  try {
    // Store CSV rows in batches to avoid memory issues
    const batchSize = 1000;
    const batches = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      batches.push(batch);
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const rowsToInsert = batch.map((row, index) => ({
        uploadId: csvUpload.id,
        rowIndex: batchIndex * batchSize + index,
        data: row,
      }));

      await prisma.csvRow.createMany({
        data: rowsToInsert,
      });
    }

    // Update upload status to completed
    await prisma.csvUpload.update({
      where: { id: csvUpload.id },
      data: {
        status: 'completed',
      },
    });

    return {
      uploadId: csvUpload.id,
      totalRows: data.length,
      validRows: data.length,
    };
  } catch (error) {
    // Update upload status to failed
    await prisma.csvUpload.update({
      where: { id: csvUpload.id },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

export async function getCsvUpload(uploadId: string, userId?: string) {
  const where = userId ? { id: uploadId, userId } : { id: uploadId };

  const upload = await prisma.csvUpload.findUnique({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!upload) return null;

  const rowCount = await prisma.csvRow.count({
    where: { uploadId },
  });

  return {
    ...upload,
    _count: { csvRows: rowCount },
  };
}

export async function getCsvData(
  uploadId: string,
  options: {
    page?: number;
    limit?: number;
    userId?: string;
  } = {},
) {
  const { page = 1, limit = 100, userId } = options;
  const skip = (page - 1) * limit;

  // First verify the upload exists and user has access
  const upload = await getCsvUpload(uploadId, userId);
  if (!upload) {
    throw new Error('CSV upload not found or access denied');
  }

  // Get paginated rows
  const rows = await prisma.csvRow.findMany({
    where: { uploadId },
    orderBy: { rowIndex: 'asc' },
    skip,
    take: limit,
  });

  return {
    upload,
    rows: rows.map((row) => ({
      id: row.id,
      rowIndex: row.rowIndex,
      data: row.data,
      createdAt: row.createdAt,
    })),
    pagination: {
      page,
      limit,
      total: upload._count.csvRows,
      totalPages: Math.ceil(upload._count.csvRows / limit),
    },
  };
}

export async function getUserCsvUploads(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
  } = {},
) {
  const { page = 1, limit = 10, status } = options;
  const skip = (page - 1) * limit;

  const where: Record<string, string> = { userId };
  if (status) {
    where.status = status;
  }

  const [uploads, total] = await Promise.all([
    prisma.csvUpload.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.csvUpload.count({ where }),
  ]);

  // Add row counts
  const uploadsWithCounts = await Promise.all(
    uploads.map(async (upload) => {
      const rowCount = await prisma.csvRow.count({
        where: { uploadId: upload.id },
      });
      return {
        ...upload,
        _count: { csvRows: rowCount },
      };
    }),
  );

  return {
    uploads: uploadsWithCounts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function deleteCsvUpload(uploadId: string, userId?: string) {
  const where = userId ? { id: uploadId, userId } : { id: uploadId };

  // Verify upload exists and user has access
  const upload = await prisma.csvUpload.findUnique({ where });
  if (!upload) {
    throw new Error('CSV upload not found or access denied');
  }

  // Delete the upload (rows will be deleted automatically due to cascade)
  await prisma.csvUpload.delete({
    where: { id: uploadId },
  });

  return { success: true };
}

function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  const nameWithoutExtension = originalFilename.replace(/\.[^/.]+$/, '');

  return `${nameWithoutExtension}_${timestamp}_${random}.${extension}`;
}
