// src/components/Dashboard/JobsList/JobFilter.tsx
import { Input } from '@/components/Input';
import TagsInput from '@/components/TagsInput';
import TokenFilter from '@/components/TokenFilter';
import { ArbitratorSelector } from '@/components/ArbitratorSelector';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import type { Token } from '@/tokens';
import type { Arbitrator } from '@effectiveacceleration/contracts';
import { unitsDeliveryTime } from '@/utils/utils';
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
  Scale
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
  setSelectedArbitratorAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  arbitrators?: Arbitrator[];
  multipleApplicants: boolean | undefined;
  setMultipleApplicants: React.Dispatch<React.SetStateAction<boolean | undefined>>;
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

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
        width: rect.width
      });
    }
  }, [isFocused]);

  // Auto-expand filters if any are active from URL
  useEffect(() => {
    const hasActiveFilters = selectedToken || minTokens || minDeadline || tags.length > 0 || 
                           selectedArbitratorAddress || creatorAddress || typeof multipleApplicants !== 'undefined';
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
    typeof multipleApplicants !== 'undefined'
  ].filter(Boolean).length;

  return (
    <div className='mb-6 w-full'>
      <div className='relative rounded-xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50'>
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent' />

        <div className='p-5'>
          <div className='space-y-3'>
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-lg blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300' />
              <div className='relative'>
                <Search className={`
                  absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4
                  transition-all duration-200
                  ${isFocused ? 'text-blue-500 scale-110' : 'text-gray-400'}
                `} />

                <input
                  ref={searchInputRef}
                  placeholder={isFocused ? 'Type to search...' : 'Search jobs by title, description, skills...'}
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
                    if ((e.key === 'Tab' || e.key === 'ArrowRight') && searchSuggestion) {
                      e.preventDefault();
                      setLocalSearch(searchSuggestion);
                      setSearchSuggestion('');
                    }
                  }}
                  className={`
                    w-full pl-10 pr-24 h-10 rounded-lg border bg-white
                    text-sm text-gray-900 placeholder-gray-400
                    border-0 outline-none focus:outline-none focus:ring-0
                    transition-all duration-200
                    ${isFocused ? 'border-gray-300' : 'border-gray-200 hover:border-gray-300'}
                  `}
                  style={{ 
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: isFocused ? 'rgb(209 213 219)' : 'rgb(229 231 235)',
                    boxShadow: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    height: '40px'
                  }}
                />

                {searchSuggestion && isFocused && (
                  <div className='absolute inset-0 pl-10 pr-24 flex items-center pointer-events-none z-[100]'>
                    <span className='text-gray-400'>
                      {localSearch}
                      <span className='text-gray-300'>{searchSuggestion.slice(localSearch.length)}</span>
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
                    className='absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 dark:hover:text-gray-200 dark:hover:bg-gray-800/50 transition-all duration-200'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                )}

                <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1'>
                  {!localSearch && !isFocused && (
                    <kbd className='hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded'>
                      ⌘K
                    </kbd>
                  )}
                  {isFocused && (
                    <kbd className='inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded'>
                      ENTER
                    </kbd>
                  )}
                  {searchSuggestion && isFocused && (
                    <kbd className='inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded animate-pulse'>
                      TAB
                    </kbd>
                  )}
                </div>
              </div>

              {/* Quick search suggestions - Portaled to body */}
              {isFocused && !localSearch && typeof document !== 'undefined' && ReactDOM.createPortal(
                <>
                  <div 
                    style={{ 
                      position: 'fixed',
                      inset: 0,
                      zIndex: 9998 
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
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}
                    className='dark:bg-gray-900 dark:border-gray-700'
                  >
                    <p className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-2'>Quick searches:</p>
                    <div className='flex flex-wrap gap-2'>
                      {['Video', 'Programming', 'Blockchain', 'AI', 'Design'].map((tag) => (
                        <button
                          key={tag}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setLocalSearch(tag.toLowerCase());
                            setSearch(tag.toLowerCase());
                          }}
                          className='px-2.5 py-1 text-xs font-medium rounded-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:border-blue-800 dark:hover:text-blue-400 transition-all duration-200'
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className='mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50'>
                      <p className='text-xs text-gray-400 dark:text-gray-500'>
                        <span className='font-medium'>Pro tip:</span> Press Enter to search, use quotes for exact matches
                      </p>
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`
                w-full flex items-center justify-between px-4 py-2.5 rounded-lg
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-700
                hover:border-gray-300 dark:hover:border-gray-600
                transition-all duration-200 group
              `}
              style={{ height: '40px' }}
            >
              <span className='flex items-center gap-2.5'>
                <div className='relative'>
                  <Filter className='h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors' />
                  {activeFilterCount > 0 && (
                    <span className='absolute -top-1.5 -right-1.5 h-3 w-3 bg-blue-500 rounded-full animate-pulse' />
                  )}
                </div>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Advanced Filters
                </span>
                {activeFilterCount > 0 && (
                  <span className='px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'>
                    {activeFilterCount} active
                  </span>
                )}
              </span>
              <ChevronDown className={`
                h-4 w-4 text-gray-400 transition-transform duration-200
                ${showAdvanced ? 'rotate-180' : ''}
              `} />
            </button>
          </div>

          <div className={`
            grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden transition-all duration-300 ease-in-out
            ${showAdvanced ? 'mt-6 opacity-100 max-h-[1000px]' : 'mt-0 opacity-0 max-h-0'}
          `}>
            <div className='space-y-5'>
              <div className='relative group'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <Coins className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Token Settings
                    </h3>
                  </div>
                  <button
                    onClick={handleClearToken}
                    className={`
                      p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100
                      dark:hover:text-gray-200 dark:hover:bg-gray-800
                      transition-all duration-200
                      ${(selectedToken || minTokens) ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}
                    title="Clear token settings"
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

              <div className='relative group'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Minimum Delivery Time
                    </h3>
                  </div>
                  <button
                    onClick={handleClearDeliveryTime}
                    className={`
                      p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100
                      dark:hover:text-gray-200 dark:hover:bg-gray-800
                      transition-all duration-200
                      ${minDeadline ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}
                    title="Clear delivery time"
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
                
                <div className='relative flex items-center rounded-lg border bg-white transition-all duration-200'
                  style={{
                    height: '40px',
                    borderColor: 'rgb(229 231 235)'
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
                    className='flex-1 pr-2 h-full bg-transparent text-sm text-gray-900 placeholder-gray-400 border-0 outline-none focus:outline-none focus:ring-0'
                    style={{ 
                      boxShadow: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none'
                    }}
                  />

                  <div className='h-5 w-px bg-gray-200 mr-1' />

                  <div className='relative h-full'>
                    <button
                      type='button'
                      onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                      className='h-full px-3 flex items-center gap-2 rounded-r-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150'
                      style={{ minWidth: '100px' }}
                    >
                      <span className='text-sm font-medium text-gray-700'>
                        {selectedUnitTime.name}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${showUnitDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showUnitDropdown && (
                      <>
                        <div className='fixed inset-0 z-10' onClick={() => setShowUnitDropdown(false)} />
                        <div className='absolute right-0 top-full mt-1 z-20 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1'>
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
                                    ? 'bg-blue-50 text-blue-700 font-medium' 
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

              <div className='relative group'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <Scale className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Arbitrator
                    </h3>
                  </div>
                  <button
                    onClick={handleClearArbitrator}
                    className={`
                      p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100
                      dark:hover:text-gray-200 dark:hover:bg-gray-800
                      transition-all duration-200
                      ${selectedArbitratorAddress ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}
                    title="Clear arbitrator"
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
              <div className='relative group'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <TagIcon className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Tags
                    </h3>
                  </div>
                  <button
                    onClick={handleClearTags}
                    className={`
                      p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100
                      dark:hover:text-gray-200 dark:hover:bg-gray-800
                      transition-all duration-200
                      ${tags.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}
                    title="Clear tags"
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
                <TagsInput tags={tags} setTags={setTags} />
              </div>

              <div className='relative group'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Creator Address
                    </h3>
                  </div>
                  <button
                    onClick={handleClearCreatorAddress}
                    className={`
                      p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100
                      dark:hover:text-gray-200 dark:hover:bg-gray-800
                      transition-all duration-200
                      ${creatorAddress ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}
                    title="Clear creator address"
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
                <input
                  placeholder='0x...'
                  value={creatorAddress || ''}
                  onChange={(e) => setCreatorAddress(e.target.value || undefined)}
                  className='w-full px-3 h-10 rounded-lg border bg-white text-sm text-gray-900 placeholder-gray-400 font-mono border-gray-200 hover:border-gray-300 transition-all duration-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-300'
                  style={{ 
                    height: '40px',
                    boxShadow: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none'
                  }}
                />
              </div>

              <div className='relative group'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Multiple Applicants
                    </h3>
                  </div>
                  <button
                    onClick={handleClearMultipleApplicants}
                    className={`
                      p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100
                      dark:hover:text-gray-200 dark:hover:bg-gray-800
                      transition-all duration-200
                      ${typeof multipleApplicants !== 'undefined' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}
                    title="Clear selection"
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
                <div className='flex gap-3'>
                  {['No', 'Yes'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setMultipleApplicants(option === 'Yes')}
                      className={`
                        flex-1 px-4 py-2 rounded-lg text-sm font-medium
                        transition-all duration-200 border
                        ${multipleApplicants === (option === 'Yes')
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }
                      `}
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
            <div className='mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Sparkles className='h-3.5 w-3.5 text-blue-500' />
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
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
                  className='text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors'
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
