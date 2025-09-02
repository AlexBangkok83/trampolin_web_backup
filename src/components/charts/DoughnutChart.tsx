'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';
import { useChartConfig } from '@/contexts/ChartConfigContext';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
  className?: string;
}

export function DoughnutChart({ data, options, className }: DoughnutChartProps) {
  const { getChartOptions } = useChartConfig();

  // Get chart options from context and merge with any provided options
  const chartOptions = getChartOptions('doughnut');
  const mergedOptions = {
    ...chartOptions,
    ...options,
    // Ensure we have proper responsive settings
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // Keep the doughnut hole size consistent
  } as ChartOptions<'doughnut'>;

  return (
    <div className={`h-full w-full ${className || ''}`}>
      <Doughnut data={data} options={mergedOptions} />
    </div>
  );
}
