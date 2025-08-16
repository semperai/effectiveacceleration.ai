'use client';

import { useState, useMemo } from 'react';
import { Layout } from '@/components/Dashboard/Layout';
import { Link } from '@/components/Link';
import {
  ScaleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  StarIcon,
  ClockIcon,
} from '@heroicons/react/20/solid';
import ProfileImage from '@/components/ProfileImage';
import moment from 'moment';

interface Arbitrator {
  id: string;
  address_: string;
  name: string;
  bio: string;
  avatar: string;
  fee: number;
  publicKey: string;
  timestamp: number;
  settledCount: number;
  refusedCount: number;
}

interface ArbitratorsListClientProps {
  initialArbitrators: Arbitrator[];
}

type SortOption = 'settled' | 'fee' | 'rate' | 'newest' | 'oldest';
type FilterOption = 'all' | 'experienced' | 'new';

export default function ArbitratorsListClient({
  initialArbitrators,
}: ArbitratorsListClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('settled');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Calculate derived data for each arbitrator
  const arbitratorsWithStats = useMemo(() => {
    return initialArbitrators.map((arb) => {
      const totalCases = arb.settledCount + arb.refusedCount;
      const settlementRate =
        totalCases > 0 ? Math.round((arb.settledCount / totalCases) * 100) : 0;
      const feePercentage = (arb.fee / 100).toFixed(2);

      // Determine experience level
      let experienceLevel: string;
      if (totalCases === 0) experienceLevel = 'New';
      else if (totalCases < 5) experienceLevel = 'Beginner';
      else if (totalCases < 20) experienceLevel = 'Intermediate';
      else if (totalCases < 50) experienceLevel = 'Experienced';
      else experienceLevel = 'Expert';

      return {
        ...arb,
        totalCases,
        settlementRate,
        feePercentage,
        experienceLevel,
      };
    });
  }, [initialArbitrators]);

  // Filter arbitrators
  const filteredArbitrators = useMemo(() => {
    let filtered = arbitratorsWithStats;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (arb) =>
          arb.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          arb.address_.toLowerCase().includes(searchTerm.toLowerCase()) ||
          arb.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy === 'experienced') {
      filtered = filtered.filter((arb) => arb.totalCases >= 5);
    } else if (filterBy === 'new') {
      filtered = filtered.filter((arb) => arb.totalCases === 0);
    }

    // Apply sorting
    switch (sortBy) {
      case 'settled':
        filtered = [...filtered].sort(
          (a, b) => b.settledCount - a.settledCount
        );
        break;
      case 'fee':
        filtered = [...filtered].sort((a, b) => a.fee - b.fee);
        break;
      case 'rate':
        filtered = [...filtered].sort(
          (a, b) => b.settlementRate - a.settlementRate
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
  }, [arbitratorsWithStats, searchTerm, sortBy, filterBy]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = filteredArbitrators.length;
    const totalSettled = filteredArbitrators.reduce(
      (sum, arb) => sum + arb.settledCount,
      0
    );
    const avgFee =
      total > 0
        ? (
            filteredArbitrators.reduce((sum, arb) => sum + arb.fee, 0) /
            total /
            100
          ).toFixed(2)
        : '0';
    const experienced = filteredArbitrators.filter(
      (arb) => arb.totalCases >= 5
    ).length;

    return { total, totalSettled, avgFee, experienced };
  }, [filteredArbitrators]);

  return (
    <Layout>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
            Arbitrators
          </h1>
          <p className='mt-2 text-gray-600 dark:text-gray-400'>
            Find trusted arbitrators to resolve disputes fairly and efficiently
          </p>
        </div>

        {/* Stats Overview */}
        <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Total Arbitrators
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  {stats.total}
                </p>
              </div>
              <UserIcon className='h-8 w-8 text-blue-500' />
            </div>
          </div>

          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Cases Settled
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  {stats.totalSettled}
                </p>
              </div>
              <CheckCircleIcon className='h-8 w-8 text-green-500' />
            </div>
          </div>

          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Average Fee
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  {stats.avgFee}%
                </p>
              </div>
              <CurrencyDollarIcon className='h-8 w-8 text-yellow-500' />
            </div>
          </div>

          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Experienced
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  {stats.experienced}
                </p>
              </div>
              <StarIcon className='h-8 w-8 text-purple-500' />
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
                <option value='all'>All Arbitrators</option>
                <option value='experienced'>Experienced (5+ cases)</option>
                <option value='new'>New Arbitrators</option>
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
                <option value='settled'>Most Cases Settled</option>
                <option value='fee'>Lowest Fee</option>
                <option value='rate'>Highest Success Rate</option>
                <option value='newest'>Newest First</option>
                <option value='oldest'>Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Arbitrators Grid */}
        {filteredArbitrators.length === 0 ? (
          <div className='rounded-lg bg-white py-12 text-center dark:bg-gray-800'>
            <ScaleIcon className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-lg font-medium text-gray-900 dark:text-gray-100'>
              No arbitrators found
            </h3>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filteredArbitrators.map((arbitrator) => (
              <Link
                key={arbitrator.id}
                href={`/arbitrators/${arbitrator.address_}`}
                className='group'
              >
                <div className='h-full overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800'>
                  {/* Card Header */}
                  <div className='p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center space-x-3'>
                        {/* Avatar - Using ProfileImage component */}
                        <ProfileImage className='h-12 w-12' user={arbitrator} />

                        {/* Name and Address */}
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400'>
                            {arbitrator.name || 'Unnamed Arbitrator'}
                          </h3>
                          <p className='font-mono text-sm text-gray-500 dark:text-gray-400'>
                            {arbitrator.address_.slice(0, 6)}...
                            {arbitrator.address_.slice(-4)}
                          </p>
                        </div>
                      </div>

                      {/* Experience Badge */}
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          arbitrator.experienceLevel === 'Expert'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : arbitrator.experienceLevel === 'Experienced'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : arbitrator.experienceLevel === 'Intermediate'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : arbitrator.experienceLevel === 'Beginner'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {arbitrator.experienceLevel}
                      </span>
                    </div>

                    {/* Bio */}
                    {arbitrator.bio && (
                      <p className='mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>
                        {arbitrator.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className='mt-4 grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Fee
                        </p>
                        <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                          {arbitrator.feePercentage}%
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Settlement Rate
                        </p>
                        <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                          {arbitrator.totalCases > 0
                            ? `${arbitrator.settlementRate}%`
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Cases Settled
                        </p>
                        <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                          {arbitrator.settledCount}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Cases Refused
                        </p>
                        <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                          {arbitrator.refusedCount}
                        </p>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className='mt-4 border-t border-gray-200 pt-4 dark:border-gray-700'>
                      <div className='flex items-center text-xs text-gray-500 dark:text-gray-400'>
                        <ClockIcon className='mr-1 h-3 w-3' />
                        Member since{' '}
                        {moment(arbitrator.timestamp * 1000).format('MMM YYYY')}
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
