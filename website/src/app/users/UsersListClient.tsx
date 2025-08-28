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
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import ProfileImage from '@/components/ProfileImage';
import moment from 'moment';

interface Review {
  rating: number;
}

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
  reviews?: Review[];
}

interface UsersListClientProps {
  initialUsers: User[];
}

type SortOption =
  | 'reviews'
  | 'rating'
  | 'reputation'
  | 'newest'
  | 'oldest'
  | 'name';
type FilterOption = 'all' | 'highRated' | 'experienced' | 'new';

export default function UsersListClient({
  initialUsers,
}: UsersListClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('reviews');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Calculate derived data for each user
  const usersWithStats = useMemo(() => {
    return initialUsers.map((user) => {
      const totalReputation = user.reputationUp + user.reputationDown;
      const successRate =
        totalReputation > 0
          ? Math.round((user.reputationUp / totalReputation) * 100)
          : 0;

      // Calculate the actual average rating
      let actualAverageRating = 0;
      if (user.reviews && user.reviews.length > 0) {
        // Calculate from actual review ratings
        const totalRating = user.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        actualAverageRating = totalRating / user.reviews.length;
      } else if (user.numberOfReviews > 0) {
        // Fallback: averageRating field is a SUM, not an average
        actualAverageRating = user.averageRating / user.numberOfReviews;
      }

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
      else if (successRate >= 90 && user.numberOfReviews >= 5)
        badgeColor = 'silver';
      else if (successRate >= 80) badgeColor = 'bronze';
      else badgeColor = 'none';

      return {
        ...user,
        calculatedAverageRating: actualAverageRating, // Add new field for calculated average
        successRate,
        userLevel,
        badgeColor,
        totalReputation,
      };
    });
  }, [initialUsers]);

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = usersWithStats;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.address_.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'highRated':
        filtered = filtered.filter(
          (user) =>
            user.calculatedAverageRating >= 4 && user.numberOfReviews > 0
        );
        break;
      case 'experienced':
        filtered = filtered.filter((user) => user.numberOfReviews >= 10);
        break;
      case 'new':
        filtered = filtered.filter((user) => user.numberOfReviews === 0);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'reviews':
        filtered = [...filtered].sort(
          (a, b) => b.numberOfReviews - a.numberOfReviews
        );
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => {
          // Users with no reviews go to the end
          if (a.numberOfReviews === 0) return 1;
          if (b.numberOfReviews === 0) return -1;
          return b.calculatedAverageRating - a.calculatedAverageRating;
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
    const usersWithReviews = filteredUsers.filter(
      (user) => user.numberOfReviews > 0
    );
    const withReviews = usersWithReviews.length;

    // Calculate average rating properly
    let avgRating = '0';
    if (withReviews > 0) {
      const sumOfAverages = usersWithReviews.reduce((sum, user) => {
        return sum + user.calculatedAverageRating;
      }, 0);
      avgRating = (sumOfAverages / withReviews).toFixed(1);
    }

    const topRated = filteredUsers.filter(
      (user) => user.calculatedAverageRating >= 4.5 && user.numberOfReviews >= 5
    ).length;

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
      <div className='mx-auto max-w-7xl'>
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
        <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Total Users
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  {stats.total}
                </p>
              </div>
              <UserGroupIcon className='h-8 w-8 text-blue-500' />
            </div>
          </div>

          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  With Reviews
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  {stats.withReviews}
                </p>
              </div>
              <ChartBarIcon className='h-8 w-8 text-green-500' />
            </div>
          </div>

          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Avg Rating
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  {stats.avgRating}
                </p>
              </div>
              <StarIcon className='h-8 w-8 text-yellow-500' />
            </div>
          </div>

          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Top Rated
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  {stats.topRated}
                </p>
              </div>
              <CheckBadgeIcon className='h-8 w-8 text-purple-500' />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className='mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
          <div className='flex flex-col gap-4 lg:flex-row'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <MagnifyingGlassIcon className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
                <input
                  type='text'
                  placeholder='Search by name, address, or bio...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
                />
              </div>
            </div>

            {/* Filter */}
            <div className='flex items-center gap-2'>
              <FunnelIcon className='h-5 w-5 text-gray-500' />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
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
                className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
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
          <div className='rounded-lg bg-white py-12 text-center dark:bg-gray-800'>
            <UserIcon className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-lg font-medium text-gray-900 dark:text-gray-100'>
              No users found
            </h3>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filteredUsers.map((user) => (
              <Link
                key={user.id}
                href={`/users/${user.address_}`}
                className='group'
              >
                <div className='h-full overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800'>
                  {/* Card Header */}
                  <div className='p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center space-x-3'>
                        {/* Avatar */}
                        <ProfileImage className='h-12 w-12' user={user} />

                        {/* Name and Address */}
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400'>
                              {user.name || 'Unnamed User'}
                            </h3>
                            {/* Success Badge */}
                            {user.badgeColor !== 'none' && (
                              <CheckBadgeIcon
                                className={`h-5 w-5 ${
                                  user.badgeColor === 'gold'
                                    ? 'text-yellow-500'
                                    : user.badgeColor === 'silver'
                                      ? 'text-gray-400'
                                      : 'text-orange-600'
                                }`}
                              />
                            )}
                          </div>
                          <p className='font-mono text-sm text-gray-500 dark:text-gray-400'>
                            {user.address_.slice(0, 6)}...
                            {user.address_.slice(-4)}
                          </p>
                        </div>
                      </div>

                      {/* User Level Badge */}
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          user.userLevel === 'Top Rated'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : user.userLevel === 'Experienced'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : user.userLevel === 'Established'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : user.userLevel === 'Rising'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {user.userLevel}
                      </span>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <p className='mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>
                        {user.bio}
                      </p>
                    )}

                    {/* Rating */}
                    {user.numberOfReviews > 0 && (
                      <div className='mt-3 flex items-center gap-2'>
                        {getRatingStars(user.calculatedAverageRating)}
                        <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                          {user.calculatedAverageRating.toFixed(1)}
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
                          <HandThumbUpIcon className='mr-1 h-4 w-4 text-green-500' />
                          <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                            {user.reputationUp}
                          </p>
                        </div>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Positive
                        </p>
                      </div>
                      <div className='text-center'>
                        <div className='flex items-center justify-center'>
                          <HandThumbDownIcon className='mr-1 h-4 w-4 text-red-500' />
                          <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                            {user.reputationDown}
                          </p>
                        </div>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Negative
                        </p>
                      </div>
                      <div className='text-center'>
                        <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                          {user.successRate}%
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Success
                        </p>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className='mt-4 border-t border-gray-200 pt-4 dark:border-gray-700'>
                      <div className='flex items-center text-xs text-gray-500 dark:text-gray-400'>
                        <ClockIcon className='mr-1 h-3 w-3' />
                        Member since{' '}
                        {moment(user.timestamp * 1000).format('MMM YYYY')}
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
