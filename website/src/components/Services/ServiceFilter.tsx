import { Input } from '@/components/Input';
import TagsInput from '@/components/TagsInput';
import { TokenSelector } from '@/components/TokenSelector';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import type { Token } from '@/lib/tokens';
import {
  ChevronDown,
  Filter,
  Search,
  X,
  Clock,
  Coins,
  Tag as TagIcon,
  User,
  Star,
} from 'lucide-react';
import type React from 'react';
import { useState, useEffect, useRef } from 'react';

type ServiceFilterProps = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  selectedToken: Token | undefined;
  setSelectedToken: React.Dispatch<React.SetStateAction<Token | undefined>>;
  minPrice: number | undefined;
  setMinPrice: React.Dispatch<React.SetStateAction<number | undefined>>;
  maxPrice: number | undefined;
  setMaxPrice: React.Dispatch<React.SetStateAction<number | undefined>>;
  minRating: number | undefined;
  setMinRating: React.Dispatch<React.SetStateAction<number | undefined>>;
  sellerAddress: string | undefined;
  setSellerAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  serviceState: number | undefined;
  setServiceState: React.Dispatch<React.SetStateAction<number | undefined>>;
};

export const ServiceFilter = ({
  search,
  setSearch,
  tags,
  setTags,
  selectedToken,
  setSelectedToken,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  sellerAddress,
  setSellerAddress,
  serviceState,
  setServiceState,
}: ServiceFilterProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Add keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-expand filters if any are active from URL
  useEffect(() => {
    const hasActiveFilters =
      selectedToken ||
      minPrice ||
      maxPrice ||
      tags.length > 0 ||
      sellerAddress ||
      minRating ||
      typeof serviceState !== 'undefined';
    if (hasActiveFilters) {
      setShowAdvanced(true);
    }
  }, []);

  const handleClearToken = () => {
    setSelectedToken(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
  };

  const handleClearTags = () => {
    setTags([]);
  };

  const handleClearRating = () => {
    setMinRating(undefined);
  };

  const handleClearSellerAddress = () => {
    setSellerAddress(undefined);
  };

  const handleClearServiceState = () => {
    setServiceState(undefined);
  };

  const handleSearchSubmit = () => {
    setSearch(localSearch);
  };

  // Count active filters
  const activeFilterCount = [
    selectedToken,
    minPrice,
    maxPrice,
    tags.length > 0,
    sellerAddress,
    minRating,
    typeof serviceState !== 'undefined',
  ].filter(Boolean).length;

  return (
    <div className='mb-6 w-full'>
      <div className='relative rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50'>
        <div className='absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent' />

        <div className='p-5'>
          <div className='space-y-3'>
            <div className='group relative'>
              <div className='absolute inset-0 rounded-lg bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-100' />
              <div className='relative'>
                <Search
                  className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-all duration-200 ${isFocused ? 'scale-110 text-green-500' : 'text-gray-400'} `}
                />

                <input
                  ref={searchInputRef}
                  placeholder={
                    isFocused
                      ? 'Type to search...'
                      : 'Search services by title, description, skills...'
                  }
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    if (localSearch !== search) {
                      handleSearchSubmit();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSubmit();
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className={`h-10 w-full rounded-lg border-0 bg-white pl-10 pr-24 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:outline-none focus:ring-0 ${isFocused ? 'border-gray-300' : 'border-gray-200 hover:border-gray-300'} `}
                  style={{
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: isFocused
                      ? 'rgb(209 213 219)'
                      : 'rgb(229 231 235)',
                    boxShadow: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    height: '40px',
                  }}
                />

                {localSearch && (
                  <button
                    onClick={() => {
                      setLocalSearch('');
                      setSearch('');
                    }}
                    className='absolute right-12 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-all duration-200 hover:bg-gray-100/50 hover:text-gray-600 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                )}

                <kbd className='absolute right-3 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'>
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className='flex w-full items-center justify-between rounded-lg border border-gray-200/50 bg-white/50 p-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300/50 hover:bg-white/60 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-gray-600/50 dark:hover:bg-gray-800/60'
            >
              <div className='flex items-center gap-2'>
                <Filter className='h-4 w-4' />
                <span>Advanced Filters</span>
                {activeFilterCount > 0 && (
                  <span className='ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white'>
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
              <div className='space-y-4 rounded-lg border border-gray-200/50 bg-gray-50/50 p-4 dark:border-gray-700/50 dark:bg-gray-800/50'>
                {/* Tags */}
                <div>
                  <div className='mb-2 flex items-center justify-between'>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                      <TagIcon className='h-4 w-4' />
                      Tags
                    </label>
                    {tags.length > 0 && (
                      <button
                        onClick={handleClearTags}
                        className='text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <TagsInput
                    tags={tags}
                    setTags={setTags}
                  />
                </div>

                {/* Token & Price */}
                <div>
                  <div className='mb-2 flex items-center justify-between'>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                      <Coins className='h-4 w-4' />
                      Token & Price Range
                    </label>
                    {(selectedToken || minPrice || maxPrice) && (
                      <button
                        onClick={handleClearToken}
                        className='text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <TokenSelector
                      selectedToken={selectedToken}
                      onClick={(token) => setSelectedToken(token)}
                    />
                    <div className='grid grid-cols-2 gap-2'>
                      <Input
                        type='number'
                        placeholder='Min price'
                        value={minPrice?.toString() || ''}
                        onChange={(e) =>
                          setMinPrice(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                      <Input
                        type='number'
                        placeholder='Max price'
                        value={maxPrice?.toString() || ''}
                        onChange={(e) =>
                          setMaxPrice(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <div className='mb-2 flex items-center justify-between'>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                      <Star className='h-4 w-4' />
                      Minimum Rating
                    </label>
                    {minRating && (
                      <button
                        onClick={handleClearRating}
                        className='text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <select
                    value={minRating || ''}
                    onChange={(e) =>
                      setMinRating(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className='w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                  >
                    <option value=''>Any rating</option>
                    <option value='40000'>4+ stars</option>
                    <option value='45000'>4.5+ stars</option>
                  </select>
                </div>

                {/* Service State */}
                <div>
                  <div className='mb-2 flex items-center justify-between'>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                      <Filter className='h-4 w-4' />
                      Service Status
                    </label>
                    {typeof serviceState !== 'undefined' && (
                      <button
                        onClick={handleClearServiceState}
                        className='text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <select
                    value={serviceState?.toString() || ''}
                    onChange={(e) =>
                      setServiceState(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className='w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                  >
                    <option value=''>All statuses</option>
                    <option value='0'>Active only</option>
                    <option value='1'>Paused only</option>
                  </select>
                </div>

                {/* Seller Address */}
                <div>
                  <div className='mb-2 flex items-center justify-between'>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                      <User className='h-4 w-4' />
                      Seller Address
                    </label>
                    {sellerAddress && (
                      <button
                        onClick={handleClearSellerAddress}
                        className='text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder='0x...'
                    value={sellerAddress || ''}
                    onChange={(e) => setSellerAddress(e.target.value || undefined)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent' />
      </div>
    </div>
  );
};
