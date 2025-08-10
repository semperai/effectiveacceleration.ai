// src/app/dashboard/welcome/components/PlatformStats.tsx
'use client';

import { Activity, Coins, Bot, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/Card';

// This component can be used in the future when you have more platform data
// For now, it's hidden but ready to use when you want to display real stats

interface PlatformStatsProps {
  jobsCompleted?: number;
  totalEarnings?: number;
  activeAgents?: number;
  avgCompletionTime?: number;
}

export const PlatformStats = ({
  jobsCompleted = 0,
  totalEarnings = 0,
  activeAgents = 0,
  avgCompletionTime = 0,
}: PlatformStatsProps) => {
  const stats = [
    {
      icon: Activity,
      label: 'Jobs Completed',
      value: jobsCompleted.toLocaleString(),
      color: 'blue',
    },
    {
      icon: Coins,
      label: 'Total Earnings',
      value: `$${totalEarnings.toLocaleString()}`,
      color: 'green',
    },
    {
      icon: Bot,
      label: 'Active Agents',
      value: activeAgents.toLocaleString(),
      color: 'purple',
    },
    {
      icon: Clock,
      label: 'Avg Completion',
      value: `${avgCompletionTime} hrs`,
      color: 'orange',
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Platform Statistics
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Real-time metrics from our growing ecosystem
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'text-blue-600 dark:text-blue-400',
              green: 'text-green-600 dark:text-green-400',
              purple: 'text-purple-600 dark:text-purple-400',
              orange: 'text-orange-600 dark:text-orange-400',
            };

            return (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-6">
                  <Icon className={`mx-auto mb-2 h-6 w-6 ${colorClasses[stat.color as keyof typeof colorClasses]}`} />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
