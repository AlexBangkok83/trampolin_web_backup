'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChartOptions } from 'chart.js';

export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple';
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';

interface ChartConfig {
  theme: Theme;
  animation: boolean;
  animationDuration: number;
  showLegend: boolean;
  legendPosition: 'top' | 'bottom' | 'left' | 'right' | 'chartArea';
  showGrid: boolean;
  showTooltips: boolean;
  borderWidth: number;
  borderRadius: number;
}

interface ChartConfigContextType extends ChartConfig {
  updateConfig: (updates: Partial<ChartConfig>) => void;
  getChartOptions: <T extends ChartType>(type: T) => ChartOptions<T>;
}

const defaultConfig: ChartConfig = {
  theme: 'light',
  animation: true,
  animationDuration: 1000,
  showLegend: true,
  legendPosition: 'top',
  showGrid: true,
  showTooltips: true,
  borderWidth: 2,
  borderRadius: 6,
};

const ChartConfigContext = createContext<ChartConfigContextType | undefined>(undefined);

export const ChartConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ChartConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chartConfig');
      return saved ? JSON.parse(saved) : defaultConfig;
    }
    return defaultConfig;
  });

  // Save to localStorage when config changes
  useEffect(() => {
    localStorage.setItem('chartConfig', JSON.stringify(config));
  }, [config]);

  const updateConfig = (updates: Partial<ChartConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const getChartOptions = <T extends ChartType>(type: T): ChartOptions<T> => {
    // Create base options with proper typing
    const baseOptions: ChartOptions<T> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: config.animation ? config.animationDuration : 0,
      },
      plugins: {
        legend: {
          display: config.showLegend,
          position: config.legendPosition,
          labels: {
            color: config.theme === 'dark' ? '#fff' : '#111827',
          },
        },
        tooltip: {
          enabled: config.showTooltips,
        },
      },
    } as ChartOptions<T>;

    // Add grid configuration for cartesian charts (line, bar)
    if (type === 'line' || type === 'bar') {
      return {
        ...baseOptions,
        scales: {
          x: {
            type: 'category',
            grid: {
              display: config.showGrid,
              color: config.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: config.theme === 'dark' ? '#9ca3af' : '#4b5563',
            },
          },
          y: {
            type: 'linear',
            grid: {
              display: config.showGrid,
              color: config.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: config.theme === 'dark' ? '#9ca3af' : '#4b5563',
            },
            beginAtZero: true,
          },
        },
      } as ChartOptions<T>;
    }

    return baseOptions;
  };

  return (
    <ChartConfigContext.Provider
      value={{
        ...config,
        updateConfig,
        getChartOptions,
      }}
    >
      {children}
    </ChartConfigContext.Provider>
  );
};

export const useChartConfig = () => {
  const context = useContext(ChartConfigContext);
  if (context === undefined) {
    throw new Error('useChartConfig must be used within a ChartConfigProvider');
  }
  return context;
};

export const useChartTheme = () => {
  const { theme, updateConfig } = useChartConfig();
  return { theme, setTheme: (newTheme: Theme) => updateConfig({ theme: newTheme }) };
};
