import React from 'react';
import { AlertCircle, Sparkles, Home } from 'lucide-react';
import { SearchBar } from '@/components/NotFound/SearchBar';
import { BackButton } from '@/components/NotFound/BackButton';
import { Layout } from '@/components/Dashboard/Layout';
import {
  PiBriefcase,
  PiPencilLine,
  PiBooks,
  PiHandWaving,
} from 'react-icons/pi';

export default function NotFound() {
  const suggestions = [
    {
      title: 'Open Jobs',
      href: '/dashboard/open-job-list',
      icon: <PiBriefcase className='h-7 w-7' />,
      color: 'text-blue-500',
    },
    {
      title: 'Post a Job',
      href: '/dashboard/post-job',
      icon: <PiPencilLine className='h-7 w-7' />,
      color: 'text-green-500',
    },
    {
      title: 'Documentation',
      href: 'https://docs.effectiveacceleration.ai',
      icon: <PiBooks className='h-7 w-7' />,
      color: 'text-purple-500',
    },
    {
      title: 'Welcome',
      href: '/dashboard/welcome',
      icon: <PiHandWaving className='h-7 w-7' />,
      color: 'text-yellow-500',
    },
  ];

  return (
    <Layout borderless hiddenSidebar pageTitle='Page Not Found' is404>
      <div className='relative min-h-customHeader overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black'>
        {/* Background elements */}
        <div className='absolute inset-0'>
          {/* Grid pattern - using CSS gradient */}
          <div
            className='absolute inset-0 opacity-20'
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Animated gradient orbs - using Tailwind's arbitrary properties for animation delays */}
          <div className='absolute -left-20 top-20 h-72 w-72 animate-pulse rounded-full bg-blue-500/20 blur-3xl' />
          <div className='absolute -right-20 bottom-20 h-72 w-72 animate-pulse rounded-full bg-purple-500/20 blur-3xl [animation-delay:2s]' />
          <div className='absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-indigo-500/10 blur-3xl [animation-delay:4s]' />
        </div>

        {/* Main content */}
        <div className='relative flex min-h-customHeader items-center justify-center px-4 py-16 sm:px-6 lg:px-8'>
          <div className='w-full max-w-2xl'>
            {/* Glass card container - with animate-in class for CSS animation */}
            <div className='relative rounded-3xl bg-white/5 backdrop-blur-xl duration-700 animate-in fade-in slide-in-from-bottom-4'>
              {/* Border gradient */}
              <div className='absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px]'>
                <div className='h-full w-full rounded-3xl bg-gray-900/90 backdrop-blur-xl' />
              </div>

              {/* Content */}
              <div className='relative p-8 sm:p-12'>
                {/* Error badge */}
                <div className='mb-8 flex justify-center'>
                  <div className='relative'>
                    <div className='absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 opacity-50 blur-xl' />
                    <div className='relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 px-4 py-2 ring-1 ring-red-500/50 backdrop-blur-sm'>
                      <AlertCircle className='h-5 w-5 text-white' />
                      <span className='text-sm font-semibold text-white'>
                        404 ERROR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main heading with gradient */}
                <h1 className='mb-4 text-center text-5xl font-bold sm:text-6xl'>
                  <span className='bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent'>
                    Page Not Found
                  </span>
                </h1>

                {/* Animated text */}
                <div className='mb-8 text-center'>
                  <p className='text-lg text-gray-300'>
                    Looks like this page got lost in the
                    <span className='ml-1 inline-flex items-center gap-1'>
                      <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold text-transparent'>
                        acceleration
                      </span>
                      <Sparkles className='h-4 w-4 animate-pulse text-yellow-400' />
                    </span>
                  </p>
                </div>

                {/* Search bar - Client Component */}
                <div className='mb-8'>
                  <SearchBar />
                </div>

                {/* Quick links */}
                <div className='mb-8'>
                  <p className='mb-4 text-center text-sm font-medium text-gray-400'>
                    Quick Links
                  </p>
                  <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                    {suggestions.map((item) => (
                      <a
                        key={item.title}
                        href={item.href}
                        className='group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10'
                      >
                        {/* Hover effect */}
                        <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full' />

                        <div className='relative'>
                          <div
                            className={`mb-2 flex justify-center ${item.color} opacity-80 transition-opacity group-hover:opacity-100`}
                          >
                            {item.icon}
                          </div>
                          <div className='text-xs font-medium text-gray-300 transition-colors group-hover:text-white'>
                            {item.title}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
                  <BackButton />
                </div>

                {/* Fun message */}
                <div className='mt-8 text-center'>
                  <p className='text-xs text-gray-500'>
                    Error Code: 404 | Time: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Floating decorative elements - using Tailwind's animate-bounce */}
            <div className='absolute -bottom-8 -left-8 h-24 w-24 animate-bounce rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl [animation-delay:2s]' />
            <div className='absolute -right-8 -top-8 h-20 w-20 animate-bounce rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl' />
          </div>
        </div>
      </div>
    </Layout>
  );
}
