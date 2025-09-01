# Chart Components

This directory contains reusable chart components built with Chart.js and React Chart.js 2. The components are designed to be flexible, responsive, and easy to use.

## Available Components

### 1. LineChart

A line chart component for displaying trends over time.

```tsx
import { LineChart } from '@/components/charts';

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
  ],
};

<LineChart data={data} />;
```

### 2. BarChart

A bar chart component for comparing categories.

```tsx
import { BarChart } from '@/components/charts';

const data = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: 'Sales',
      data: [30, 50, 40, 60],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

<BarChart data={data} />;
```

### 3. PieChart

A pie chart component for showing parts of a whole.

```tsx
import { PieChart } from '@/components/charts';

const data = {
  labels: ['Red', 'Blue', 'Yellow'],
  datasets: [
    {
      data: [300, 50, 100],
      backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
    },
  ],
};

<PieChart data={data} />;
```

### 4. DoughnutChart

A doughnut chart component, similar to pie charts but with a hole in the center.

```tsx
import { DoughnutChart } from '@/components/charts';

const data = {
  labels: ['Direct', 'Social', 'Referral'],
  datasets: [
    {
      data: [55, 30, 15],
      backgroundColor: ['rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
    },
  ],
};

<DoughnutChart data={data} />;
```

## useChartData Hook

A custom hook to help format data for the chart components.

```tsx
import { useChartData } from '@/hooks/useChartData';

const data = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  // ...
];

const { chartData } = useChartData({
  data,
  xField: 'month',
  yField: 'revenue',
  label: 'Monthly Revenue',
  type: 'line', // 'line' | 'bar' | 'pie' | 'doughnut'
});

<LineChart data={chartData} />;
```

## Styling

All chart components accept a `className` prop for custom styling:

```tsx
<LineChart data={data} className="h-64 w-full" />
```

## Customization

You can customize the charts by passing an `options` prop:

```tsx
<LineChart
  data={data}
  options={{
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Over Time',
      },
    },
  }}
/>
```

## Example Dashboard

Check out the example dashboard at `/dashboard/analytics` to see all chart types in action.
