import { Input } from '@/components/Input';
import TagsInput from '@/components/TagsInput';
import TokenFilter from '@/components/TokenFilter';
import { ArbitratorSelector } from '@/components/ArbitratorSelector';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import type { Token } from '@/lib/tokens';
import type { Arbitrator } from '@effectiveacceleration/contracts';
import { unitsDeliveryTime } from '@/lib/constants';
import {
  ChevronDown,
  Filter,
  Search,
  X,
  Sparkles,
  Clock,
  Coins,
  Tag as TagIcon,
  User,
  Users,
  Scale,
} from 'lucide-react';
import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom';

type JobFilterProps = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  selectedToken: Token | undefined;
  setSelectedToken: React.Dispatch<React.SetStateAction<Token | undefined>>;
  minDeadline: number | undefined;
  setMinDeadline: React.Dispatch<React.SetStateAction<number | undefined>>;
  selectedUnitTime: ComboBoxOption;
  setSelectedUnitTime: React.Dispatch<React.SetStateAction<ComboBoxOption>>;
  minTokens: number | undefined;
  setMinTokens: React.Dispatch<React.SetStateAction<number | undefined>>;
  selectedArbitratorAddress: string | undefined;
  setSelectedArbitratorAddress: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  arbitrators?: Arbitrator[];
  multipleApplicants: boolean | undefined;
  setMultipleApplicants: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
  setCreatorAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  creatorAddress: string | undefined;
};

export const JobFilter = ({
  search,
  setSearch,
  tags,
  setTags,
  selectedToken,
  setSelectedToken,
  minDeadline,
  setMinDeadline,
  selectedUnitTime,
  setSelectedUnitTime,
  minTokens,
  setMinTokens,
  selectedArbitratorAddress,
  setSelectedArbitratorAddress,
  arbitrators = [],
  multipleApplicants,
  setMultipleApplicants,
  setCreatorAddress,
  creatorAddress,
}: JobFilterProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchSuggestion, setSearchSuggestion] = useState('');
  const [localSearch, setLocalSearch] = useState(search);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

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

  // Update dropdown position when focused
  useEffect(() => {
    if (isFocused && searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isFocused]);

  // Auto-expand filters if any are active from URL
  useEffect(() => {
    const hasActiveFilters =
      selectedToken ||
      minTokens ||
      minDeadline ||
      tags.length > 0 ||
      selectedArbitratorAddress ||
      creatorAddress ||
      typeof multipleApplicants !== 'undefined';
    if (hasActiveFilters) {
      setShowAdvanced(true);
    }
  }, []);

  const handleClearMultipleApplicants = () => {
    setMultipleApplicants(undefined);
  };

  const handleClearToken = () => {
    setSelectedToken(undefined);
    setMinTokens(undefined);
  };

  const handleClearArbitrator = () => {
    setSelectedArbitratorAddress(undefined);
  };

  const handleClearDeliveryTime = () => {
    setMinDeadline(undefined);
  };

  const handleClearTags = () => {
    setTags([]);
  };

  const handleClearCreatorAddress = () => {
    setCreatorAddress(undefined);
  };

  const handleSearchSubmit = () => {
    setSearch(localSearch);
  };

  // Count active filters
  const activeFilterCount = [
    selectedToken,
    minTokens,
    minDeadline,
    tags.length > 0,
    selectedArbitratorAddress,
    creatorAddress,
    typeof multipleApplicants !== 'undefined',
  ].filter(Boolean).length;

  return (
    <div className='mb-6 w-full'>
      <div className='relative rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50'>
        <div className='absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent' />

        <div className='p-5'>
          <div className='space-y-3'>
            <div className='group relative'>
              <div className='absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-100' />
              <div className='relative'>
                <Search
                  className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-all duration-200 ${isFocused ? 'scale-110 text-blue-500' : 'text-gray-400'} `}
                />

                <input
                  ref={searchInputRef}
                  placeholder={
                    isFocused
                      ? 'Type to search...'
                      : 'Search jobs by title, description, skills...'
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
                    if (
                      (e.key === 'Tab' || e.key === 'ArrowRight') &&
                      searchSuggestion
                    ) {
                      e.preventDefault();
                      setLocalSearch(searchSuggestion);
                      setSearchSuggestion('');
                    }
                  }}
                  className={`h-10 w-full rounded-lg border border-0 bg-white pl-10 pr-24 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:outline-none focus:ring-0 ${isFocused ? 'border-gray-300' : 'border-gray-200 hover:border-gray-300'} `}
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

                {searchSuggestion && isFocused && (
                  <div className='pointer-events-none absolute inset-0 z-[100] flex items-center pl-10 pr-24'>
                    <span className='text-gray-400'>
                      {localSearch}
                      <span className='text-gray-300'>
                        {searchSuggestion.slice(localSearch.length)}
                      </span>
                    </span>
                  </div>
                )}

                {localSearch && (
                  <button
                    onClick={() => {
                      setLocalSearch('');
                      setSearch('');
                      setSearchSuggestion('');
                    }}
                    className='absolute right-12 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-all duration-200 hover:bg-gray-100/50 hover:text-gray-600 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                )}

                <div className='absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1'>
                  {!localSearch && !isFocused && (
                    <kbd className='hidden items-center gap-0.5 rounded border border-gray-200/50 bg-gray-100/50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 sm:inline-flex dark:border-gray-700/50 dark:bg-gray-800/50'>
                      ⌘K
                    </kbd>
                  )}
                  {isFocused && (
                    <kbd className='inline-flex items-center gap-0.5 rounded border border-gray-200/50 bg-gray-100/50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-gray-700/50 dark:bg-gray-800/50'>
                      ENTER
                    </kbd>
                  )}
                  {searchSuggestion && isFocused && (
                    <kbd className='inline-flex animate-pulse items-center gap-0.5 rounded border border-gray-200/50 bg-gray-100/50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-gray-700/50 dark:bg-gray-800/50'>
                      TAB
                    </kbd>
                  )}
                </div>
              </div>

              {/* Quick search suggestions - Portaled to body */}
              {isFocused &&
                !localSearch &&
                typeof document !== 'undefined' &&
                ReactDOM.createPortal(
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9998,
                      }}
                      onClick={() => setIsFocused(false)}
                    />
                    <div
                      style={{
                        position: 'fixed',
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                        zIndex: 9999,
                        padding: '0.75rem',
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        border: '1px solid rgb(229 231 235)',
                        boxShadow:
                          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      }}
                      className='dark:border-gray-700 dark:bg-gray-900'
                    >
                      <p className='mb-2 text-xs font-medium text-gray-500 dark:text-gray-400'>
                        Quick searches:
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {[
                          'Video',
                          'Programming',
                          'Blockchain',
                          'AI',
                          'Design',
                        ].map((tag) => (
                          <button
                            key={tag}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setLocalSearch(tag.toLowerCase());
                              setSearch(tag.toLowerCase());
                            }}
                            className='rounded-full border border-gray-200/50 bg-white/50 px-2.5 py-1 text-xs font-medium text-gray-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400'
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <div className='mt-2 border-t border-gray-200/50 pt-2 dark:border-gray-700/50'>
                        <p className='text-xs text-gray-400 dark:text-gray-500'>
                          <span className='font-medium'>Pro tip:</span> Press
                          Enter to search, use quotes for exact matches
                        </p>
                      </div>
                    </div>
                  </>,
                  document.body
                )}
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`group flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 transition-all duration-200 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600`}
              style={{ height: '40px' }}
            >
              <span className='flex items-center gap-2.5'>
                <div className='relative'>
                  <Filter className='h-4 w-4 text-gray-500 transition-colors group-hover:text-gray-700 dark:group-hover:text-gray-300' />
                  {activeFilterCount > 0 && (
                    <span className='absolute -right-1.5 -top-1.5 h-3 w-3 animate-pulse rounded-full bg-blue-500' />
                  )}
                </div>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Advanced Filters
                </span>
                {activeFilterCount > 0 && (
                  <span className='rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400'>
                    {activeFilterCount} active
                  </span>
                )}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''} `}
              />
            </button>
          </div>

          <div
            className={`grid grid-cols-1 gap-6 overflow-hidden transition-all duration-300 ease-in-out lg:grid-cols-2 ${showAdvanced ? 'mt-6 max-h-[1000px] opacity-100' : 'mt-0 max-h-0 opacity-0'} `}
          >
            <div className='space-y-5'>
              <div className='group relative'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Coins className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Token Settings
                    </h3>
                  </div>
                  <button
                    onClick={handleClearToken}
                    className={`rounded-md p-1 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 ${selectedToken || minTokens ? 'opacity-100' : 'pointer-events-none opacity-0'} `}
                    title='Clear token settings'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
                <TokenFilter
                  selectedToken={selectedToken}
                  onTokenSelect={setSelectedToken}
                  minAmount={minTokens}
                  onMinAmountChange={setMinTokens}
                />
              </div>

              <div className='group relative'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Minimum Delivery Time
                    </h3>
                  </div>
                  <button
                    onClick={handleClearDeliveryTime}
                    className={`rounded-md p-1 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 ${minDeadline ? 'opacity-100' : 'pointer-events-none opacity-0'} `}
                    title='Clear delivery time'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>

                <div
                  className='relative flex items-center rounded-lg border bg-white transition-all duration-200'
                  style={{
                    height: '40px',
                    borderColor: 'rgb(229 231 235)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgb(229 231 235)';
                  }}
                >
                  <div className='pl-3 pr-2'>
                    <Clock className='h-4 w-4 text-gray-400' />
                  </div>

                  <input
                    type='text'
                    inputMode='numeric'
                    value={minDeadline || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d+$/.test(val)) {
                        setMinDeadline(val ? parseInt(val) : undefined);
                      }
                    }}
                    placeholder='0'
                    className='h-full flex-1 border-0 bg-transparent pr-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:outline-none focus:ring-0'
                    style={{
                      boxShadow: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                    }}
                  />

                  <div className='mr-1 h-5 w-px bg-gray-200' />

                  <div className='relative h-full'>
                    <button
                      type='button'
                      onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                      className='flex h-full cursor-pointer items-center gap-2 rounded-r-lg px-3 transition-colors duration-150 hover:bg-gray-50'
                      style={{ minWidth: '100px' }}
                    >
                      <span className='text-sm font-medium text-gray-700'>
                        {selectedUnitTime.name}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${showUnitDropdown ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {showUnitDropdown && (
                      <>
                        <div
                          className='fixed inset-0 z-10'
                          onClick={() => setShowUnitDropdown(false)}
                        />
                        <div className='absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg'>
                          {unitsDeliveryTime.map((unit) => {
                            const isSelected = selectedUnitTime.id === unit.id;
                            return (
                              <button
                                key={unit.id}
                                type='button'
                                onClick={() => {
                                  setSelectedUnitTime(unit);
                                  setShowUnitDropdown(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-sm transition-colors duration-150 ${
                                  isSelected
                                    ? 'bg-blue-50 font-medium text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {unit.name}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className='group relative'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Scale className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Arbitrator
                    </h3>
                  </div>
                  <button
                    onClick={handleClearArbitrator}
                    className={`rounded-md p-1 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 ${selectedArbitratorAddress ? 'opacity-100' : 'pointer-events-none opacity-0'} `}
                    title='Clear arbitrator'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
                <ArbitratorSelector
                  arbitrators={arbitrators}
                  selectedAddress={selectedArbitratorAddress || ''}
                  onChange={(addr) => setSelectedArbitratorAddress(addr)}
                  placeholder='Filter by arbitrator'
                  showExternalLink={false}
                  showNoArbitrator={false}
                />
              </div>
            </div>

            <div className='space-y-5'>
              <div className='group relative'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <TagIcon className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Tags
                    </h3>
                  </div>
                  <button
                    onClick={handleClearTags}
                    className={`rounded-md p-1 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 ${tags.length > 0 ? 'opacity-100' : 'pointer-events-none opacity-0'} `}
                    title='Clear tags'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
                <TagsInput tags={tags} setTags={setTags} />
              </div>

              <div className='group relative'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Creator Address
                    </h3>
                  </div>
                  <button
                    onClick={handleClearCreatorAddress}
                    className={`rounded-md p-1 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 ${creatorAddress ? 'opacity-100' : 'pointer-events-none opacity-0'} `}
                    title='Clear creator address'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
                <input
                  placeholder='0x...'
                  value={creatorAddress || ''}
                  onChange={(e) =>
                    setCreatorAddress(e.target.value || undefined)
                  }
                  className='h-10 w-full rounded-lg border border-gray-200 bg-white px-3 font-mono text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 hover:border-gray-300 focus:border-gray-300 focus:outline-none focus:ring-0'
                  style={{
                    height: '40px',
                    boxShadow: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                  }}
                />
              </div>

              <div className='group relative'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Multiple Applicants
                    </h3>
                  </div>
                  <button
                    onClick={handleClearMultipleApplicants}
                    className={`rounded-md p-1 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 ${typeof multipleApplicants !== 'undefined' ? 'opacity-100' : 'pointer-events-none opacity-0'} `}
                    title='Clear selection'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
                <div className='flex gap-3'>
                  {['No', 'Yes'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setMultipleApplicants(option === 'Yes')}
                      className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        multipleApplicants === (option === 'Yes')
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-600'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      } `}
                      style={{ height: '40px' }}
                    >
                      <span className='flex items-center justify-center gap-2'>
                        {option === 'Yes' && <Users className='h-3.5 w-3.5' />}
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {showAdvanced && activeFilterCount > 0 && (
            <div className='mt-4 border-t border-gray-200/50 pt-4 dark:border-gray-700/50'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Sparkles className='h-3.5 w-3.5 text-blue-500' />
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    {activeFilterCount} filter
                    {activeFilterCount !== 1 ? 's' : ''} active
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleClearToken();
                    handleClearDeliveryTime();
                    handleClearArbitrator();
                    handleClearTags();
                    handleClearCreatorAddress();
                    handleClearMultipleApplicants();
                  }}
                  className='text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobFilter;
