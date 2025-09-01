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

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  className?: string;
}

export function LineChart({ data, options, className }: LineChartProps) {
  const defaultOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    ...options,
  };

  return (
    <div className={`h-full min-h-[300px] w-full ${className}`}>
      <Line data={data} options={defaultOptions} />
    </div>
  );
}
