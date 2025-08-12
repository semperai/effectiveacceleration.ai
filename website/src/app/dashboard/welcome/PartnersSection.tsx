'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const partners = [
  {
    id: 1,
    name: 'Arbius',
    logo: '/partners/arbius.webp',
    website: 'https://arbius.ai',
  },
  {
    id: 2,
    name: 'Unicrow',
    logo: '/partners/unicrow.png',
    website: 'https://unicrow.io',
  },
  {
    id: 3,
    name: 'Arbitrum',
    logo: '/partners/arbitrum.png',
    website: 'https://arbitrum.io',
  },
  {
    id: 4,
    name: 'IPFS',
    logo: '/partners/ipfs.png',
    website: 'https://ipfs.io',
  },
];

export const PartnersSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const position = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollPosition(position);
    }
  };

  return (
    <section className='relative bg-white py-16 dark:bg-gray-900'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <h3 className='text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
            Built With
          </h3>
        </div>

        {/* Partners container with horizontal scroll on mobile */}
        <div className='relative mt-8'>
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className='scrollbar-hide overflow-x-auto md:overflow-visible'
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className='inline-flex items-center gap-4 px-2 md:w-full md:justify-center md:gap-8 md:px-0'>
              {partners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group relative flex flex-shrink-0 items-center justify-center rounded-lg p-2 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  aria-label={`Visit ${partner.name} website`}
                >
                  <div className='relative h-[45px] w-[100px] opacity-60 transition-opacity duration-300 group-hover:opacity-100 sm:h-[55px] sm:w-[120px] md:h-[70px] md:w-[155px] lg:h-[80px] lg:w-[175px]'>
                    <Image
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      fill
                      sizes='(max-width: 640px) 100px, (max-width: 768px) 120px, (max-width: 1024px) 155px, 175px'
                      className='object-contain filter dark:brightness-0 dark:invert'
                      priority
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Gradient indicators for scroll on mobile */}
          {showScrollIndicator && (
            <>
              <div className='pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent md:hidden dark:from-gray-900' />
              <div className='pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent md:hidden dark:from-gray-900' />
            </>
          )}
        </div>

        {/* Scroll progress indicator for mobile */}
        {showScrollIndicator && (
          <div className='mt-4 flex justify-center md:hidden'>
            <div className='relative h-1 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
              <div
                className='absolute left-0 top-0 h-full bg-gray-400 transition-all duration-150 dark:bg-gray-500'
                style={{
                  width: `${Math.max(20, 100 - scrollPosition * 0.8)}%`,
                  transform: `translateX(${scrollPosition}%)`,
                }}
              />
            </div>
          </div>
        )}

        {/* Alternative: Dot indicators */}
        {showScrollIndicator && (
          <div className='mt-2 flex justify-center gap-1 md:hidden'>
            <span className='h-1 w-1 rounded-full bg-gray-300 text-xs dark:bg-gray-600'>
              •
            </span>
            <span className='text-xs text-gray-400 dark:text-gray-500'>
              Swipe for more
            </span>
            <span className='h-1 w-1 rounded-full bg-gray-300 text-xs dark:bg-gray-600'>
              •
            </span>
          </div>
        )}
      </div>

      {/* Hide scrollbar with CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};
