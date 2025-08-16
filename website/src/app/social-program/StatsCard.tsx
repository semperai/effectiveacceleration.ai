import React from 'react';
import { TrendingUp } from 'lucide-react';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
}

export const StatsCard = ({
  icon,
  title,
  value,
  subtitle,
  trend,
}: StatsCardProps) => (
  <div className='rounded-xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/50'>
    <div className='flex items-start justify-between'>
      <div className='flex-1'>
        <div className='mb-2 flex items-center gap-2'>
          <div className='text-blue-500'>{icon}</div>
          <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
            {title}
          </p>
        </div>
        <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
          {value}
        </p>
        {subtitle && (
          <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
            {subtitle}
          </p>
        )}
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            trend.isPositive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          <TrendingUp
            className={`h-3 w-3 ${!trend.isPositive ? 'rotate-180' : ''}`}
          />
          {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  </div>
);
