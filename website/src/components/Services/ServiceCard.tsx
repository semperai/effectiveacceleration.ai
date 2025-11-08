import { Badge } from '@/components/Badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip';
import {
  formatTimeLeft,
  formatTokenNameAndAmount,
  tokenIcon,
} from '@/lib/utils';
import type { Service } from '@/hooks/subsquid/useService';
import {
  Clock,
  Cloud,
  LinkIcon,
  Package,
  Camera,
  HelpCircle,
  Star,
  ShoppingCart,
  ArrowUpRight,
  TrendingUp,
  CheckCircle,
  Pause,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ProfileImage from '@/components/ProfileImage';
import useUsersByAddresses from '@/hooks/subsquid/useUsersByAddresses';

const ServiceStateEnum = {
  Active: 0,
  Paused: 1,
  Deleted: 2,
} as const;

export const ServiceCard = ({ service }: { service: Service }) => {
  const [isHovered, setIsHovered] = useState(false);

  const { data: users } = useUsersByAddresses([service.seller]);
  const sellerUser = users?.[service.seller];

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDeliveryIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'ipfs':
        return <Cloud className='h-3.5 w-3.5' />;
      case 'url':
        return <LinkIcon className='h-3.5 w-3.5' />;
      case 'courier':
        return <Package className='h-3.5 w-3.5' />;
      case 'digital proof':
        return <Camera className='h-3.5 w-3.5' />;
      default:
        return <HelpCircle className='h-3.5 w-3.5' />;
    }
  };

  const renderStars = (rating: number) => {
    const stars = rating / 10000; // Convert from scaled rating
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.5;

    return (
      <div className='flex items-center gap-0.5'>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < fullStars
                ? 'fill-yellow-400 text-yellow-400'
                : i === fullStars && hasHalfStar
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'text-gray-300'
            }`}
          />
        ))}
        <span className='ml-1 text-xs font-medium text-gray-600 dark:text-gray-400'>
          {stars.toFixed(1)}
        </span>
      </div>
    );
  };

  const isActive = service.state === ServiceStateEnum.Active;
  const isPaused = service.state === ServiceStateEnum.Paused;

  return (
    <Link
      href={`/services/${service.id}`}
      key={service.id}
      className='group block'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm transition-all duration-300 ease-out hover:border-gray-300/50 hover:bg-white/60 hover:shadow-lg hover:shadow-gray-200/50 dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:border-gray-600/50 dark:hover:bg-gray-800/60 dark:hover:shadow-black/20 ${isPaused ? 'opacity-75' : ''}`}
      >
        {/* Animated gradient overlay on hover */}
        <div
          className={`duration-600 absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100 ${isHovered ? 'animate-shimmer' : ''} `}
        />

        {/* Status indicator bar */}
        <div
          className={`absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-gradient-to-b ${
            isActive
              ? 'from-green-400 to-emerald-400'
              : 'from-gray-400 to-gray-500'
          } opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
        />

        <div className='relative p-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              {/* Title and status row */}
              <div className='mb-2 flex flex-wrap items-start gap-2'>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400'>
                  {service.title}
                  {isPaused && (
                    <Pause className='h-4 w-4 text-gray-500' />
                  )}
                  <ArrowUpRight className='h-4 w-4 transform opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100' />
                </h3>
              </div>

              {/* Tags with glass effect */}
              <div className='mb-3 flex flex-wrap items-center gap-2'>
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm transition-all duration-200 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 dark:text-gray-300'
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Seller section with avatar and name */}
              <div className='mb-3 flex items-center gap-3'>
                {sellerUser && (
                  <ProfileImage
                    user={sellerUser}
                    className='h-8 w-8 transition-transform duration-200 group-hover:scale-105'
                  />
                )}
                <div className='flex flex-col gap-0.5'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                      {sellerUser?.name || 'Anonymous Seller'}
                    </span>
                    <span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300'>
                      Seller
                    </span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='flex cursor-help items-center gap-1.5 text-gray-500 dark:text-gray-400'>
                          <span className='font-mono text-xs'>
                            {formatAddress(service.seller)}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className='text-xs'>Seller: {service.seller}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Rating and stats */}
              {service.numberOfRatings > 0 && (
                <div className='mb-3 flex items-center gap-3'>
                  {renderStars(service.averageRating)}
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    ({service.numberOfRatings} {service.numberOfRatings === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Orders completed */}
              {service.completedOrders > 0 && (
                <div className='flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400'>
                  <CheckCircle className='h-3.5 w-3.5 text-green-500' />
                  <span className='text-xs'>
                    {service.completedOrders} {service.completedOrders === 1 ? 'order' : 'orders'} completed
                  </span>
                </div>
              )}
            </div>

            {/* Price badge */}
            <div className='flex flex-col items-end gap-2'>
              <div className='flex items-center gap-2 rounded-lg border border-gray-200/50 bg-white/50 px-4 py-2 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/70 dark:border-gray-700/50 dark:bg-gray-800/50 dark:group-hover:bg-gray-800/70'>
                <span className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                  {formatTokenNameAndAmount(service.paymentToken, service.price)}
                </span>
                <img
                  src={tokenIcon(service.paymentToken)}
                  alt=''
                  className='h-5 w-5 transition-transform duration-200 group-hover:scale-110'
                />
              </div>

              {/* ID Badge */}
              <span className='font-mono text-xs text-gray-400 dark:text-gray-500'>
                #{service.id}
              </span>
            </div>
          </div>

          {/* Bottom status pills with glass effect */}
          <div className='mt-4 flex flex-wrap gap-2'>
            <div className='flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/10 dark:text-gray-300'>
              <Clock className='h-3.5 w-3.5 text-blue-400' />
              <span>{formatTimeLeft(service.deliveryTime)}</span>
            </div>

            <div className='flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/10 dark:text-gray-300'>
              {getDeliveryIcon(service.deliveryMethod)}
              <span>{service.deliveryMethod}</span>
            </div>

            {isActive && (
              <div className='flex items-center gap-1.5 rounded-full border border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-3 py-1.5 text-xs font-medium text-green-700 backdrop-blur-sm transition-all duration-200 group-hover:from-green-500/20 group-hover:to-emerald-500/20 dark:text-green-400'>
                <ShoppingCart className='h-3.5 w-3.5' />
                <span>Available</span>
              </div>
            )}

            {isPaused && (
              <div className='flex items-center gap-1.5 rounded-full border border-gray-500/20 bg-gradient-to-r from-gray-500/10 to-gray-600/10 px-3 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm transition-all duration-200 dark:text-gray-400'>
                <Pause className='h-3.5 w-3.5' />
                <span>Paused</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover indicator line at bottom */}
        <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      </div>
    </Link>
  );
};
