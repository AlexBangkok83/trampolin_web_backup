'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale, Filler);

interface ReachDataPoint {
  date: string;
  reach: number;
}

interface ThumbnailChartProps {
  data: ReachDataPoint[];
  color?: string;
  height?: number;
}

export default function ThumbnailChart({
  data,
  color = 'rgb(59, 130, 246)',
  height = 80,
}: ThumbnailChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded bg-gray-100 dark:bg-gray-700"
        style={{ height }}
      >
        <span className="text-xs text-gray-400">No data</span>
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        data: data.map((point) => ({
          x: point.date,
          y: point.reach,
        })),
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        borderWidth: 1,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: function (context: Array<{ parsed: { x: number } }>) {
            return new Date(context[0].parsed.x).toLocaleDateString();
          },
          label: function (context: { parsed: { y: number } }) {
            const value = context.parsed.y;
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M reach';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K reach';
            }
            return value + ' reach';
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        display: false,
      },
      y: {
        display: false,
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
