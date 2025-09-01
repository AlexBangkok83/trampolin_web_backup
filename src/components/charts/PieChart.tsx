'use client';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: ChartData<'pie'>;
  options?: ChartOptions<'pie'>;
  className?: string;
}

export function PieChart({ data, options, className }: PieChartProps) {
  const defaultOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
    ...options,
  };

  return (
    <div className={`h-full min-h-[300px] w-full ${className}`}>
      <Pie data={data} options={defaultOptions} />
    </div>
  );
}
