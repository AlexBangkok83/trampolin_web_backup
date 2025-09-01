'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { useChartConfig } from '@/contexts/ChartConfigContext';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  className?: string;
}

export function LineChart({ data, options, className }: LineChartProps) {
  const { getChartOptions } = useChartConfig();

  // Get chart options from context and merge with any provided options
  const chartOptions = getChartOptions('line');
  const mergedOptions = {
    ...chartOptions,
    ...options,
    // Ensure we have proper responsive settings
    responsive: true,
    maintainAspectRatio: false,
  } as ChartOptions<'line'>;

  return (
    <div className={`h-full w-full ${className || ''}`}>
      <Line data={data} options={mergedOptions} />
    </div>
  );
}
