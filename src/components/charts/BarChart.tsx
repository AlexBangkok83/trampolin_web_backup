'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { useChartConfig } from '@/contexts/ChartConfigContext';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
  className?: string;
}

export function BarChart({ data, options, className }: BarChartProps) {
  const { getChartOptions } = useChartConfig();

  // Get chart options from context and merge with any provided options
  const chartOptions = getChartOptions('bar');
  const mergedOptions = {
    ...chartOptions,
    ...options,
    // Ensure we have proper responsive settings
    responsive: true,
    maintainAspectRatio: false,
  } as ChartOptions<'bar'>;

  return (
    <div className={`h-full w-full ${className || ''}`}>
      <Bar data={data} options={mergedOptions} />
    </div>
  );
}
