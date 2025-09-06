'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
);

interface ReachDataPoint {
  date: string;
  reach: number;
}

interface ReachDataset {
  url: string;
  originalUrl: string;
  data: ReachDataPoint[];
}

interface ReachChartProps {
  datasets: ReachDataset[];
  isLoading?: boolean;
}

const colors = [
  'rgb(59, 130, 246)', // blue
  'rgb(239, 68, 68)', // red
  'rgb(34, 197, 94)', // green
  'rgb(168, 85, 247)', // purple
  'rgb(245, 158, 11)', // amber
];

export default function ReachChart({ datasets, isLoading }: ReachChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!datasets || datasets.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No data available
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No reach data found for the provided URLs.
          </p>
        </div>
      </div>
    );
  }

  // Check if any dataset has data
  const hasData = datasets.some((dataset) => dataset.data && dataset.data.length > 0);

  if (!hasData) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No data found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No Facebook ads reach data found for these URLs.
          </p>
        </div>
      </div>
    );
  }

  // Prepare Chart.js data
  const chartData = {
    datasets: datasets
      .filter((dataset) => dataset.data && dataset.data.length > 0)
      .map((dataset, index) => ({
        label: dataset.originalUrl,
        data: dataset.data.map((point) => ({
          x: point.date,
          y: point.reach,
        })),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length]
          .replace('rgb', 'rgba')
          .replace(')', ', 0.1)'),
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Facebook Ads EU Total Reach Over Time',
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'EU Total Reach',
        },
        beginAtZero: true,
        min: 0, // Force minimum to be 0
        ticks: {
          callback: function (value: number | string) {
            // Format large numbers
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (numValue >= 1000000) {
              return (numValue / 1000000).toFixed(1) + 'M';
            } else if (numValue >= 1000) {
              return (numValue / 1000).toFixed(0) + 'K';
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          Showing daily total reach for {datasets.filter((d) => d.data?.length > 0).length} URL(s).
          Each point represents the sum of all ads for that URL on that day.
        </p>
      </div>
    </div>
  );
}
