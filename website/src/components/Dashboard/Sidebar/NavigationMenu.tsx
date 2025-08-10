'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { PiSparkle } from 'react-icons/pi';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  target: string;
  special?: boolean;
}

interface NavigationMenuProps {
  navigationItems: NavigationItem[];
}

export const NavigationMenu = ({ navigationItems }: NavigationMenuProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pathname = usePathname();

  return (
    <nav className='flex flex-1 flex-col'>
      <ul role='list' className='flex flex-1 flex-col gap-y-1 px-3'>
        {navigationItems.map((item, index) => {
          const isActive = pathname === item.href;
          const isHovered = hoveredIndex === index;

          return (
            <li key={item.name} className="relative">
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full" />
              )}

              <Link
                href={item.href}
                target={item.target}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`
                  relative group flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 ease-out overflow-hidden
                  ${item.special
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20'
                    : isActive
                      ? 'bg-white/10 backdrop-blur-sm'
                      : 'hover:bg-white/5'
                  }
                `}
              >
                {/* Icon container with animation */}
                <div className={`
                  relative flex items-center justify-center
                  transition-all duration-200
                  ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                  ${item.special ? 'text-blue-400' : ''}
                  ${isHovered ? 'scale-110' : 'scale-100'}
                `}>
                  {item.icon}
                  {item.special && (
                    <PiSparkle className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
                  )}
                </div>

                {/* Text */}
                <span className={`
                  text-sm font-medium transition-colors duration-200
                  ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                  ${item.special ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold' : ''}
                `}>
                  {item.name}
                </span>

                {/* External link indicator */}
                {item.target === '_blank' && (
                  <svg className="ml-auto w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}

                {/* Hover effect overlay */}
                <div className={`
                  absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                  transition-opacity duration-600
                  bg-gradient-to-r from-transparent via-white/[0.02] to-transparent overflow-hidden
                  ${isHovered ? 'animate-shimmer' : ''}
                `} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
