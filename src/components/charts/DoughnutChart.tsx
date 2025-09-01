'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
  className?: string;
}

export function DoughnutChart({ data, options, className }: DoughnutChartProps) {
  const defaultOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
    cutout: '70%',
    ...options,
  };

  return (
    <div className={`h-full min-h-[300px] w-full ${className}`}>
      <Doughnut data={data} options={defaultOptions} />
    </div>
  );
}
