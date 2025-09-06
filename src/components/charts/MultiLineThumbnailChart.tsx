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

interface DatasetInfo {
  data: ReachDataPoint[];
  label: string;
  color: string;
}

interface MultiLineThumbnailChartProps {
  datasets: DatasetInfo[];
  height?: number;
}

const defaultColors = [
  'rgb(59, 130, 246)', // blue
  'rgb(239, 68, 68)', // red
  'rgb(34, 197, 94)', // green
  'rgb(168, 85, 247)', // purple
  'rgb(245, 158, 11)', // amber
];

export default function MultiLineThumbnailChart({
  datasets,
  height = 80,
}: MultiLineThumbnailChartProps) {
  if (!datasets || datasets.length === 0) {
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
    datasets: datasets.map((dataset, index) => ({
      data: dataset.data.map((point) => ({
        x: point.date,
        y: point.reach,
      })),
      borderColor: dataset.color || defaultColors[index % defaultColors.length],
      backgroundColor: (dataset.color || defaultColors[index % defaultColors.length])
        .replace('rgb', 'rgba')
        .replace(')', ', 0.1)'),
      borderWidth: 1.5,
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 2,
    })),
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
          label: function (context: { datasetIndex: number; parsed: { y: number } }) {
            const datasetIndex = context.datasetIndex;
            const label = datasets[datasetIndex]?.label || `Product ${datasetIndex + 1}`;
            const value = context.parsed.y;
            let formattedValue;
            if (value >= 1000000) {
              formattedValue = (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              formattedValue = (value / 1000).toFixed(0) + 'K';
            } else {
              formattedValue = value.toString();
            }
            return `${label}: ${formattedValue} reach`;
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
