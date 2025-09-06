import crypto from 'crypto';

/**
 * Format reach numbers consistently across all pages
 */
export function formatReach(reach: number): string {
  if (reach === 0) {
    return 'NO DATA';
  }
  if (reach >= 1000000) {
    return `${(reach / 1000000).toFixed(1)}M`;
  } else if (reach >= 1000) {
    return `${(reach / 1000).toFixed(1)}K`;
  }
  return reach.toString();
}

/**
 * Get reach category and color based on reach value
 */
export function getReachCategory(reach: number): { category: string; color: string } {
  if (reach === 0) {
    return { category: 'no data', color: 'text-gray-500' };
  } else if (reach >= 100000) {
    return { category: 'high', color: 'text-green-600' };
  } else if (reach >= 50000) {
    return { category: 'medium', color: 'text-yellow-600' };
  } else if (reach > 0) {
    return { category: 'low', color: 'text-red-600' };
  } else {
    return { category: 'no data', color: 'text-gray-500' };
  }
}

/**
 * Generate a hash-based ID for a URL
 */
export function generateAnalysisId(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex').substring(0, 12);
}

/**
 * Get historical reach data for client-side components (demo/static data)
 * CLIENT-SIDE ONLY - for demo purposes. Use serverReachUtils for real data.
 */
export function getHistoricalReachForAnalysis(id: string, createdAt: Date): number {
  // Generate consistent demo data based on the ID and creation date
  const hash = parseInt(id.substring(0, 8), 16);
  const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  // Use hash and days to generate consistent fake reach numbers
  const baseReach = (hash % 1000000) + 50000; // Between 50K and 1.05M
  const ageFactor = Math.max(0.5, 1 - daysSinceCreation * 0.01); // Older = lower reach

  return Math.floor(baseReach * ageFactor);
}
