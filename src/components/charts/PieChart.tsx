'use client';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';
import { useChartConfig } from '@/contexts/ChartConfigContext';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: ChartData<'pie'>;
  options?: ChartOptions<'pie'>;
  className?: string;
}

export function PieChart({ data, options, className }: PieChartProps) {
  const { getChartOptions } = useChartConfig();

  // Get chart options from context and merge with any provided options
  const chartOptions = getChartOptions('pie');
  const mergedOptions = {
    ...chartOptions,
    ...options,
    // Ensure we have proper responsive settings
    responsive: true,
    maintainAspectRatio: false,
  } as ChartOptions<'pie'>;

  return (
    <div className={`h-full w-full ${className || ''}`}>
      <Pie data={data} options={mergedOptions} />
    </div>
  );
}
