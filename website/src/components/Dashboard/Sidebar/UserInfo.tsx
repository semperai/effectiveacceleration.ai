'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import useUser from '@/hooks/subsquid/useUser';
import useArbitrator from '@/hooks/subsquid/useArbitrator';
import ProfileImage from '@/components/ProfileImage';

export const UserInfo = () => {
  const { address } = useAccount();
  const { data: user } = useUser(address!);
  const { data: arbitrator } = useArbitrator(address!);

  // Get user display info
  const userInfo = user || arbitrator;
  const displayName = userInfo?.name || 'Anonymous';
  const displayRole = arbitrator ? 'Arbitrator' : user ? 'Member' : 'Guest';
  const initials =
    displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AN';

  // TODO: Get actual values from user data
  const jobCount = user?.reputationUp || 0; // Using reputation as placeholder
  const rating =
    userInfo && (user?.reputationUp || 0) > 0
      ? ((user?.reputationUp || 0) /
          ((user?.reputationUp || 0) + (user?.reputationDown || 0))) *
        5
      : 0;

  if (!address || !userInfo) return null;

  return (
    <div className='mx-3 mb-4 mt-auto p-4'>
      <Link href={`/users/${address}`}>
        <div className='group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/20'>
          {/* Subtle shimmer effect on hover */}
          <div className='absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100'>
            <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full' />
          </div>

          {/* Subtle glow effect */}
          <div className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5' />
          </div>

          {/* Content */}
          <div className='relative'>
            <div className='mb-3 flex items-center gap-3'>
              {/* User Avatar */}
              {userInfo.avatar ? (
                <ProfileImage
                  user={userInfo}
                  className='h-10 w-10 transition-transform duration-300 group-hover:scale-105'
                />
              ) : (
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-400 transition-transform duration-300 group-hover:scale-105'>
                  <span className='text-sm font-bold text-white'>
                    {initials}
                  </span>
                </div>
              )}

              <div className='flex-1'>
                <p className='truncate text-sm font-medium text-white transition-colors duration-300 group-hover:text-white/90'>
                  {displayName}
                </p>
                <p className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                  {displayRole}
                </p>
              </div>
            </div>
            <div className='flex gap-2'>
              <div className='flex-1 text-center'>
                <p className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                  Jobs
                </p>
                <p className='text-sm font-bold text-white'>{jobCount}</p>
              </div>
              <div className='flex-1 text-center'>
                <p className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                  Rating
                </p>
                <p className='text-sm font-bold text-white'>
                  {rating.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
