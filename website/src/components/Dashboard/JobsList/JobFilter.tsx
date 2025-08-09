import { Input } from '@/components/Input';
import TagsInput from '@/components/TagsInput';
import { TokenSelector } from '@/components/TokenSelector';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import type { Token } from '@/tokens';
import { shortenText, unitsDeliveryTime } from '@/utils/utils';
import { Field, Label } from '@headlessui/react';
import { Radio, RadioGroup } from '@/components/Radio';
import { 
  ChevronDown, 
  ChevronUp, 
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
import { useState, useEffect } from 'react';
import { Combobox } from '@/components/ComboBox';
import ListBox from '@/components/ListBox';

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
  arbitratorAddresses: string[];
  arbitratorNames: string[];
  arbitratorFees: (string | number)[];
  multipleApplicants: boolean | undefined;
  setMultipleApplicants: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setCreatorAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  creatorAddress: string | undefined;
};

const noYes = ['No', 'Yes'];

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
  arbitratorAddresses,
  arbitratorNames,
  arbitratorFees,
  multipleApplicants,
  setMultipleApplicants,
  setCreatorAddress,
  creatorAddress,
}: JobFilterProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [internalToken, setInternalToken] = useState<Token | undefined>(selectedToken);
  const [isFocused, setIsFocused] = useState(false);
  const [searchSuggestion, setSearchSuggestion] = useState('');

  // Sync internal token state with prop
  useEffect(() => {
    setInternalToken(selectedToken);
  }, [selectedToken]);

  // Add keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search jobs"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearMultipleApplicants = () => {
    setMultipleApplicants(undefined);
  };

  const handleClearToken = () => {
    setSelectedToken(undefined);
    setMinTokens(undefined);
    setInternalToken(undefined); // Clear internal state to trigger UI update
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

  const handleTokenSelect = (token: Token | undefined) => {
    setSelectedToken(token);
    setInternalToken(token);
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
      <div className='relative rounded-xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden'>
        {/* Decorative gradient line at top */}
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent' />
        
        <div className='p-5'>
          {/* Search Section */}
          <div className='space-y-3'>
            {/* Search bar with glass effect and smart features */}
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-lg blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300' />
              <div className='relative'>
                {/* Search Icon with animation */}
                <Search className={`
                  absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 
                  transition-all duration-200
                  ${isFocused ? 'text-blue-500 scale-110' : 'text-gray-400'}
                `} />
                
                {/* Main search input */}
                <Input
                  placeholder={isFocused ? 'Type to search...' : 'Search jobs by title, description, skills...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => {
                    // Accept suggestion with Tab or Right Arrow
                    if ((e.key === 'Tab' || e.key === 'ArrowRight') && searchSuggestion) {
                      e.preventDefault();
                      setSearch(searchSuggestion);
                      setSearchSuggestion('');
                    }
                  }}
                  className='bg-white/60 dark:bg-gray-900/60 border-gray-200/50 dark:border-gray-700/50 focus:bg-white/80 dark:focus:bg-gray-900/80 transition-all duration-200'
                />
                
                {/* Suggestion overlay */}
                {searchSuggestion && isFocused && (
                  <div className='absolute inset-0 pl-10 pr-24 flex items-center pointer-events-none'>
                    <span className='text-gray-400'>
                      {search}
                      <span className='text-gray-300'>{searchSuggestion.slice(search.length)}</span>
                    </span>
                  </div>
                )}

                {/* Clear button */}
                {search && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setSearchSuggestion('');
                    }}
                    className='absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 dark:hover:text-gray-200 dark:hover:bg-gray-800/50 transition-all duration-200'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                )}

                {/* Search shortcuts hint */}
                <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1'>
                  {!search && !isFocused && (
                    <kbd className='hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded'>
                      ⌘K
                    </kbd>
                  )}
                  {searchSuggestion && isFocused && (
                    <kbd className='inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded animate-pulse'>
                      TAB
                    </kbd>
                  )}
                </div>
              </div>

              {/* Quick search suggestions - show when focused and empty */}
              {isFocused && !search && (
                <div className='absolute top-full mt-2 left-0 right-0 p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-10'>
                  <p className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-2'>Quick searches:</p>
                  <div className='flex flex-wrap gap-2'>
                    {['Video', 'Programming', 'Blockchain', 'AI', 'Design'].map((tag) => (
                      <button
                        key={tag}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur
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
                      <span className='font-medium'>Pro tip:</span> Use quotes for exact matches, e.g., "smart contract"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Toggle button with active filter count */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`
                w-full flex items-center justify-between px-4 py-2.5 rounded-lg
                bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm
                border border-gray-200/50 dark:border-gray-700/50
                hover:bg-white/60 dark:hover:bg-gray-900/60
                hover:border-gray-300/50 dark:hover:border-gray-600/50
                transition-all duration-200 group
              `}
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

          {/* Advanced Filters Section */}
          <div className={`
            grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden transition-all duration-300 ease-in-out
            ${showAdvanced ? 'mt-6 opacity-100 max-h-[1000px]' : 'mt-0 opacity-0 max-h-0'}
          `}>
            {/* Left Column */}
            <div className='space-y-5'>
              {/* Token Settings */}
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
                <div className='flex flex-col sm:flex-row gap-3'>
                  <div className='flex-1'>
                    <TokenSelector
                      key={internalToken?.symbol || 'empty'} // Force re-render when token changes
                      selectedToken={internalToken}
                      onClick={handleTokenSelect}
                      persistSelection={false}
                    />
                  </div>
                  <div className='sm:w-32'>
                    <Input
                      type='number'
                      value={minTokens || ''}
                      onChange={(e) => setMinTokens(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder='Min amount'
                      className='bg-white/60 dark:bg-gray-900/60 border-gray-200/50 dark:border-gray-700/50'
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Time */}
              <div className='relative group'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-gray-400' />
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Delivery Time
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
                <div className='flex gap-3'>
                  <div className='flex-1'>
                    <Input
                      type='number'
                      placeholder={`Min time in ${selectedUnitTime.name}`}
                      value={minDeadline || ''}
                      min={1}
                      step={1}
                      onChange={(e) => {
                        if (e.target.value) {
                          const deadline = Math.abs(parseInt(e.target.value));
                          setMinDeadline(deadline);
                        } else {
                          setMinDeadline(undefined);
                        }
                      }}
                      className='bg-white/60 dark:bg-gray-900/60 border-gray-200/50 dark:border-gray-700/50'
                    />
                  </div>
                  <div className='w-32'>
                    <ListBox
                      placeholder='Unit'
                      value={selectedUnitTime}
                      onChange={(unit) => {
                        if (typeof unit !== 'string') {
                          setSelectedUnitTime(unit);
                        }
                      }}
                      options={unitsDeliveryTime.map(unit => ({ 
                        id: unit.id.toString(), 
                        name: unit.name 
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Arbitrator */}
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
                <Combobox
                  placeholder='Select arbitrator'
                  value={selectedArbitratorAddress || ''}
                  options={arbitratorAddresses.map(
                    (arbitratorAddress, index) => ({
                      value: arbitratorAddress,
                      label: `${arbitratorNames[index]} ${shortenText({ text: arbitratorAddress, maxLength: 11 })} ${+arbitratorFees[index] / 100}%`,
                    })
                  )}
                  onChange={(addr) => setSelectedArbitratorAddress(addr)}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className='space-y-5'>
              {/* Tags */}
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

              {/* Creator Address */}
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
                <Input
                  placeholder='0x...'
                  value={creatorAddress || ''}
                  onChange={(e) => setCreatorAddress(e.target.value || undefined)}
                  className='bg-white/60 dark:bg-gray-900/60 border-gray-200/50 dark:border-gray-700/50 font-mono text-sm'
                />
              </div>

              {/* Multiple Applicants */}
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
                        transition-all duration-200
                        ${multipleApplicants === (option === 'Yes')
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-2 border-blue-500/30'
                          : 'bg-white/40 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400 border-2 border-gray-200/50 dark:border-gray-700/50 hover:bg-white/60 dark:hover:bg-gray-900/60'
                        }
                      `}
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

          {/* Active filters summary */}
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
