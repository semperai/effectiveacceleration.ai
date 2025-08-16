import React from 'react';
import { PiSparkle, PiRocket, PiMegaphone, PiHandshake } from 'react-icons/pi';
import { Users } from 'lucide-react';

interface CategoryBadgeProps {
  category: string;
}

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const categoryConfig: {
    [key: string]: { color: string; icon: React.ReactNode };
  } = {
    'Content Creation': {
      color: 'blue',
      icon: <PiSparkle className='h-3 w-3' />,
    },
    'Community Building': {
      color: 'purple',
      icon: <Users className='h-3 w-3' />,
    },
    'Open Source Agents': {
      color: 'green',
      icon: <PiRocket className='h-3 w-3' />,
    },
    'Social Media': {
      color: 'pink',
      icon: <PiMegaphone className='h-3 w-3' />,
    },
    Partnerships: {
      color: 'orange',
      icon: <PiHandshake className='h-3 w-3' />,
    },
    'Podcast Appearances': {
      color: 'indigo',
      icon: <PiMegaphone className='h-3 w-3' />,
    },
    Articles: { color: 'teal', icon: <PiSparkle className='h-3 w-3' /> },
  };

  const config = categoryConfig[category] || { color: 'gray', icon: null };
  const colorClasses: { [key: string]: string } = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    purple:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    green:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    orange:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    indigo:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colorClasses[config.color]}`}
    >
      {config.icon}
      {category}
    </span>
  );
};
