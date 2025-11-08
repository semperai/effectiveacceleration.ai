'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ServiceCard } from './ServiceCard';
import { ServiceFilter } from './ServiceFilter';
import useServiceSearch from '@/hooks/subsquid/useServiceSearch';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { type Token, tokens } from '@/lib/tokens';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useSearchParams, useRouter } from 'next/navigation';
import { Package, Sparkles } from 'lucide-react';

const ServiceStateEnum = {
  Active: 0,
  Paused: 1,
  Deleted: 2,
} as const;

export const ServiceFeed = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();

  // Initialize state from URL parameters
  const getInitialValues = useCallback(() => {
    const search = searchParams.get('search') || '';
    const tagsParam = searchParams.getAll('tags');
    const tokenAddress = searchParams.get('token') || undefined;
    const minPrice = searchParams.get('minPrice') || undefined;
    const maxPrice = searchParams.get('maxPrice') || undefined;
    const minRating = searchParams.get('minRating') || undefined;
    const sellerAddress = searchParams.get('seller') || undefined;
    const serviceState = searchParams.get('state') || undefined;

    // Parse token
    let selectedToken: Token | undefined;
    if (tokenAddress) {
      selectedToken = tokens.find(
        (token) => token.id.toLowerCase() === tokenAddress.toLowerCase()
      );
    }

    // Parse tags
    const tags: Tag[] = tagsParam.map((tag, idx) => ({
      id: Date.now() + idx,
      name: tag,
    }));

    // Parse prices
    let minPriceNum: number | undefined;
    if (minPrice) {
      const parsed = parseFloat(minPrice);
      if (!isNaN(parsed)) {
        minPriceNum = parsed;
      }
    }

    let maxPriceNum: number | undefined;
    if (maxPrice) {
      const parsed = parseFloat(maxPrice);
      if (!isNaN(parsed)) {
        maxPriceNum = parsed;
      }
    }

    // Parse rating
    let minRatingNum: number | undefined;
    if (minRating) {
      const parsed = parseInt(minRating);
      if (!isNaN(parsed)) {
        minRatingNum = parsed;
      }
    }

    // Parse service state
    let serviceStateNum: number | undefined;
    if (serviceState) {
      const parsed = parseInt(serviceState);
      if (!isNaN(parsed)) {
        serviceStateNum = parsed;
      }
    }

    return {
      search,
      tags,
      selectedToken,
      minPrice: minPriceNum,
      maxPrice: maxPriceNum,
      minRating: minRatingNum,
      sellerAddress,
      serviceState: serviceStateNum,
    };
  }, [searchParams]);

  const initialValues = getInitialValues();

  const [search, setSearch] = useState<string>(initialValues.search);
  const [tags, setTags] = useState<Tag[]>(initialValues.tags);
  const [limit, setLimit] = useState<number>(20);
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    initialValues.selectedToken
  );
  const [minPrice, setMinPrice] = useState<number | undefined>(
    initialValues.minPrice
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    initialValues.maxPrice
  );
  const [minRating, setMinRating] = useState<number | undefined>(
    initialValues.minRating
  );
  const [sellerAddress, setSellerAddress] = useState<string | undefined>(
    initialValues.sellerAddress
  );
  const [serviceState, setServiceState] = useState<number | undefined>(
    initialValues.serviceState
  );

  const [now, setNow] = useState(Math.floor(new Date().getTime() / 1000));

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (selectedToken) params.set('token', selectedToken.id);
    if (minPrice !== undefined && !isNaN(minPrice)) {
      params.set('minPrice', minPrice.toString());
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      params.set('maxPrice', maxPrice.toString());
    }
    if (minRating !== undefined) {
      params.set('minRating', minRating.toString());
    }
    if (sellerAddress) params.set('seller', sellerAddress);
    if (serviceState !== undefined) {
      params.set('state', serviceState.toString());
    }
    tags.forEach((tag) => params.append('tags', tag.name));

    // Update URL without navigation
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    if (newUrl !== window.location.search) {
      router.replace(newUrl, { scroll: false });
    }
  }, [
    search,
    selectedToken,
    minPrice,
    maxPrice,
    minRating,
    sellerAddress,
    serviceState,
    tags,
    router,
  ]);

  // Fetch services with filters
  const { data: services, loading, error } = useServiceSearch({
    serviceSearch: {
      ...(search && { title: search }),
      ...(tags.length > 0 && { tags: tags.map((tag) => tag.name) }),
      ...(serviceState !== undefined ? { state: serviceState } : { state: ServiceStateEnum.Active }),
      ...(selectedToken && { paymentToken: selectedToken.id }),
      ...(selectedToken && minPrice !== undefined &&
        !isNaN(minPrice) && {
          price_gte: parseUnits(minPrice?.toString() ?? '0', selectedToken.decimals),
        }),
      ...(selectedToken && maxPrice !== undefined &&
        !isNaN(maxPrice) && {
          price_lte: parseUnits(maxPrice?.toString() ?? '0', selectedToken.decimals),
        }),
      ...(minRating !== undefined && { averageRating_gte: minRating }),
      ...(sellerAddress && { seller: sellerAddress }),
    },
    orderBy: 'timestamp_DESC',
    limit: limit,
    maxTimestamp: now,
  });

  // Fetch new services
  const { data: newServices } = useServiceSearch({
    serviceSearch: {
      ...(search && { title: search }),
      ...(tags.length > 0 && { tags: tags.map((tag) => tag.name) }),
      ...(serviceState !== undefined ? { state: serviceState } : { state: ServiceStateEnum.Active }),
      ...(selectedToken && { paymentToken: selectedToken.id }),
      ...(selectedToken && minPrice !== undefined &&
        !isNaN(minPrice) && {
          price_gte: parseUnits(minPrice?.toString() ?? '0', selectedToken.decimals),
        }),
      ...(selectedToken && maxPrice !== undefined &&
        !isNaN(maxPrice) && {
          price_lte: parseUnits(maxPrice?.toString() ?? '0', selectedToken.decimals),
        }),
      ...(minRating !== undefined && { averageRating_gte: minRating }),
      ...(sellerAddress && { seller: sellerAddress }),
    },
    orderBy: 'timestamp_DESC',
    limit: limit,
    minTimestamp: now,
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMoreServices = useCallback(() => {
    setLimit((prevLimit) => prevLimit + 10);
  }, []);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreServices();
      }
    });

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loadMoreServices]);

  return (
    <div>
      <ServiceFilter
        search={search}
        setSearch={setSearch}
        tags={tags}
        setTags={setTags}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        minRating={minRating}
        setMinRating={setMinRating}
        sellerAddress={sellerAddress}
        setSellerAddress={setSellerAddress}
        serviceState={serviceState}
        setServiceState={setServiceState}
      />

      {newServices?.length ? (
        <div className='mb-4 flex justify-center'>
          <button
            onClick={() => setNow(Math.floor(new Date().getTime() / 1000))}
            className='group relative overflow-hidden rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-4 py-2.5 backdrop-blur-sm transition-all duration-300 hover:border-green-500/30 hover:from-green-500/20 hover:to-emerald-500/20 hover:shadow-lg hover:shadow-green-500/10'
          >
            {/* Shimmer effect on hover */}
            <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full' />

            {/* Content */}
            <div className='relative flex items-center gap-3'>
              {/* Animated pulse dot */}
              <div className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75'></span>
                <span className='relative inline-flex h-2 w-2 rounded-full bg-green-500'></span>
              </div>

              {/* Text with gradient */}
              <span className='bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-sm font-semibold text-transparent'>
                {newServices.length} new {newServices.length === 1 ? 'service' : 'services'}{' '}
                available
              </span>

              {/* Icon */}
              <Sparkles className='h-4 w-4 text-green-400 transition-transform duration-300 group-hover:rotate-12' />
            </div>
          </button>
        </div>
      ) : null}

      {loading && !services ? (
        <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='h-64 animate-pulse rounded-xl border border-gray-200/50 bg-gray-100/50 dark:border-gray-700/50 dark:bg-gray-800/50'
            />
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <>
          <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <div className='h-1 w-1' ref={loadMoreRef} />
        </>
      ) : (
        <div className='flex flex-col items-center justify-center rounded-xl border border-gray-200/50 bg-white/50 p-12 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50'>
          <Package className='mb-4 h-16 w-16 text-gray-300 dark:text-gray-600' />
          <h3 className='mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300'>
            No Services Found
          </h3>
          <p className='text-center text-sm text-gray-500 dark:text-gray-400'>
            Try adjusting your filters to see more services
          </p>
        </div>
      )}

      {error && (
        <div className='mt-4 rounded-xl border border-red-200/50 bg-red-50/50 p-4 backdrop-blur-sm dark:border-red-800/50 dark:bg-red-900/20'>
          <p className='text-sm text-red-600 dark:text-red-400'>
            Error loading services. Please try again.
          </p>
        </div>
      )}
    </div>
  );
};
