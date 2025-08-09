// app/dashboard/users/UsersListClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { Layout } from '@/components/Dashboard/Layout';
import { Link } from '@/components/Link';
import {
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  StarIcon,
  ClockIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  UserGroupIcon
} from '@heroicons/react/20/solid';
import EventProfileImage from '@/components/Events/Components/EventProfileImage';
import moment from 'moment';

interface User {
  id: string;
  address_: string;
  name: string;
  bio: string;
  avatar: string;
  publicKey: string;
  averageRating: number;
  numberOfReviews: number;
  reputationUp: number;
  reputationDown: number;
  timestamp: number;
}

interface UsersListClientProps {
  initialUsers: User[];
}

type SortOption = 'reviews' | 'rating' | 'reputation' | 'newest' | 'oldest' | 'name';
type FilterOption = 'all' | 'highRated' | 'experienced' | 'new';

export default function UsersListClient({ initialUsers }: UsersListClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('reviews');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Calculate derived data for each user
  const usersWithStats = useMemo(() => {
    return initialUsers.map(user => {
      const totalReputation = user.reputationUp + user.reputationDown;
      const successRate = totalReputation > 0
        ? Math.round((user.reputationUp / totalReputation) * 100)
        : 0;

      // Determine user level based on reviews and rating
      let userLevel: string;
      if (user.numberOfReviews === 0) userLevel = 'New';
      else if (user.numberOfReviews < 5) userLevel = 'Rising';
      else if (user.numberOfReviews < 20) userLevel = 'Established';
      else if (user.numberOfReviews < 50) userLevel = 'Experienced';
      else userLevel = 'Top Rated';

      // Determine badge color based on success rate
      let badgeColor: string;
      if (successRate >= 95 && user.numberOfReviews >= 10) badgeColor = 'gold';
      else if (successRate >= 90 && user.numberOfReviews >= 5) badgeColor = 'silver';
      else if (successRate >= 80) badgeColor = 'bronze';
      else badgeColor = 'none';

      return {
        ...user,
        successRate,
        userLevel,
        badgeColor,
        totalReputation
      };
    });
  }, [initialUsers]);

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = usersWithStats;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.address_.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'highRated':
        filtered = filtered.filter(user => user.averageRating >= 4 && user.numberOfReviews > 0);
        break;
      case 'experienced':
        filtered = filtered.filter(user => user.numberOfReviews >= 10);
        break;
      case 'new':
        filtered = filtered.filter(user => user.numberOfReviews === 0);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'reviews':
        filtered = [...filtered].sort((a, b) => b.numberOfReviews - a.numberOfReviews);
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => {
          // Users with no reviews go to the end
          if (a.numberOfReviews === 0) return 1;
          if (b.numberOfReviews === 0) return -1;
          return b.averageRating - a.averageRating;
        });
        break;
      case 'reputation':
        filtered = [...filtered].sort((a, b) => b.successRate - a.successRate);
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) =>
          (a.name || 'zzz').localeCompare(b.name || 'zzz')
        );
        break;
      case 'newest':
        filtered = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'oldest':
        filtered = [...filtered].sort((a, b) => a.timestamp - b.timestamp);
        break;
    }

    return filtered;
  }, [usersWithStats, searchTerm, sortBy, filterBy]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = filteredUsers.length;
    const withReviews = filteredUsers.filter(user => user.numberOfReviews > 0).length;
    const avgRating = withReviews > 0
      ? (filteredUsers.reduce((sum, user) => sum + (user.averageRating || 0), 0) / withReviews).toFixed(1)
      : '0';
    const topRated = filteredUsers.filter(user => user.averageRating >= 4.5 && user.numberOfReviews >= 5).length;

    return { total, withReviews, avgRating, topRated };
  }, [filteredUsers]);

  const getRatingStars = (rating: number) => {
    const filledStars = Math.round(rating); // Round to nearest whole number

    return (
      <div className='flex items-center'>
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${i < filledStars ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
            Users
          </h1>
          <p className='mt-2 text-gray-600 dark:text-gray-400'>
            Connect with skilled professionals and service providers
          </p>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>Total Users</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>{stats.total}</p>
              </div>
              <UserGroupIcon className='h-8 w-8 text-blue-500' />
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>With Reviews</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>{stats.withReviews}</p>
              </div>
              <ChartBarIcon className='h-8 w-8 text-green-500' />
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>Avg Rating</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>{stats.avgRating}</p>
              </div>
              <StarIcon className='h-8 w-8 text-yellow-500' />
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>Top Rated</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>{stats.topRated}</p>
              </div>
              <CheckBadgeIcon className='h-8 w-8 text-purple-500' />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search by name, address, or bio...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            {/* Filter */}
            <div className='flex items-center gap-2'>
              <FunnelIcon className='h-5 w-5 text-gray-500' />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500'
              >
                <option value='all'>All Users</option>
                <option value='highRated'>High Rated (4+ stars)</option>
                <option value='experienced'>Experienced (10+ reviews)</option>
                <option value='new'>New Users</option>
              </select>
            </div>

            {/* Sort */}
            <div className='flex items-center gap-2'>
              <ArrowUpIcon className='h-5 w-5 text-gray-500' />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500'
              >
                <option value='reviews'>Most Reviews</option>
                <option value='rating'>Highest Rating</option>
                <option value='reputation'>Best Reputation</option>
                <option value='name'>Name (A-Z)</option>
                <option value='newest'>Newest First</option>
                <option value='oldest'>Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className='text-center py-12 bg-white dark:bg-gray-800 rounded-lg'>
            <UserIcon className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-lg font-medium text-gray-900 dark:text-gray-100'>
              No users found
            </h3>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredUsers.map((user) => (
              <Link
                key={user.id}
                href={`/dashboard/users/${user.address_}`}
                className='group'
              >
                <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full'>
                  {/* Card Header */}
                  <div className='p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center space-x-3'>
                        {/* Avatar */}
                        <EventProfileImage
                          className='h-12 w-12'
                          user={user}
                        />

                        {/* Name and Address */}
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'>
                              {user.name || 'Unnamed User'}
                            </h3>
                            {/* Success Badge */}
                            {user.badgeColor !== 'none' && (
                              <CheckBadgeIcon className={`h-5 w-5 ${
                                user.badgeColor === 'gold' ? 'text-yellow-500' :
                                user.badgeColor === 'silver' ? 'text-gray-400' :
                                'text-orange-600'
                              }`} />
                            )}
                          </div>
                          <p className='text-sm text-gray-500 dark:text-gray-400 font-mono'>
                            {user.address_.slice(0, 6)}...{user.address_.slice(-4)}
                          </p>
                        </div>
                      </div>

                      {/* User Level Badge */}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.userLevel === 'Top Rated' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        user.userLevel === 'Experienced' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        user.userLevel === 'Established' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        user.userLevel === 'Rising' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.userLevel}
                      </span>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <p className='mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
                        {user.bio}
                      </p>
                    )}

                    {/* Rating */}
                    {user.numberOfReviews > 0 && (
                      <div className='mt-3 flex items-center gap-2'>
                        {getRatingStars(user.averageRating)}
                        <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                          {user.averageRating.toFixed(1)}
                        </span>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>
                          ({user.numberOfReviews} reviews)
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className='mt-4 grid grid-cols-3 gap-3'>
                      <div className='text-center'>
                        <div className='flex items-center justify-center'>
                          <HandThumbUpIcon className='h-4 w-4 text-green-500 mr-1' />
                          <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                            {user.reputationUp}
                          </p>
                        </div>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>Positive</p>
                      </div>
                      <div className='text-center'>
                        <div className='flex items-center justify-center'>
                          <HandThumbDownIcon className='h-4 w-4 text-red-500 mr-1' />
                          <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                            {user.reputationDown}
                          </p>
                        </div>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>Negative</p>
                      </div>
                      <div className='text-center'>
                        <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                          {user.successRate}%
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>Success</p>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
                      <div className='flex items-center text-xs text-gray-500 dark:text-gray-400'>
                        <ClockIcon className='h-3 w-3 mr-1' />
                        Member since {moment(user.timestamp * 1000).format('MMM YYYY')}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
