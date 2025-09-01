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

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
  className?: string;
}

export function BarChart({ data, options, className }: BarChartProps) {
  const defaultOptions: ChartOptions<'bar'> = {
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
      <Bar data={data} options={defaultOptions} />
    </div>
  );
}
