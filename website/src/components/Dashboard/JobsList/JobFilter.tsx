import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';
import { Input } from '@/components/Input';
import { Separator } from '@/components/Separator';
import TagsInput from '@/components/TagsInput';
import { TokenSelector } from '@/components/TokenSelector';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import type { Token } from '@/tokens';
import { shortenText, unitsDeliveryTime } from '@/utils/utils';
import { Field, Label } from '@headlessui/react';
import { Radio, RadioGroup } from '@/components/Radio';
import { ChevronDown, ChevronUp, Filter, Search, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
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

  return (
    <Card className='mb-4 w-full'>
      <CardContent className='p-4'>
        {/* Always visible search bar */}
        <div className='relative'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-500' />
          <Input
            placeholder='Search jobs...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Toggle button for advanced filters */}
        <Button
          outline
          onClick={() => setShowAdvanced(!showAdvanced)}
          className='mt-2 w-full justify-between py-2 text-sm font-medium text-gray-600 hover:bg-gray-100'
        >
          <span className='flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            Advanced Filters
          </span>
          {showAdvanced ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
        </Button>

        {/* Collapsible advanced filters section */}
        {showAdvanced && (
          <div className='mt-4 space-y-6'>
            <div className=''>
              <div className='flex sm:flex-row flex-col gap-x-16'>
                <div className='flex w-full sm:w-1/2 flex-col gap-y-3'>
                  {/* Token Settings Section */}
                  <div className=''>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='text-sm font-medium text-gray-700'>
                        Token Settings
                      </h3>
                      <button
                        onClick={handleClearToken}
                        className={`text-gray-400 hover:text-gray-600 transition-all p-1 ${
                          (selectedToken || minTokens)
                            ? 'opacity-100 pointer-events-auto'
                            : 'opacity-0 pointer-events-none'
                        }`}
                        title="Clear token settings"
                        aria-hidden={!(selectedToken || minTokens)}
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                      <div className='flex-1'>
                        <TokenSelector
                          selectedToken={selectedToken}
                          onClick={setSelectedToken}
                          persistSelection={false}
                        />
                      </div>
                      <div className='w-full sm:w-40'>
                        <Input
                          type='number'
                          value={minTokens || ''}
                          onChange={(e) => setMinTokens(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder='Min. tokens'
                          className='w-full'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Time Section */}
                  <div className='flex-row'>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='text-sm font-medium text-gray-700'>
                        Delivery Time
                      </h3>
                      <button
                        onClick={handleClearDeliveryTime}
                        className={`text-gray-400 hover:text-gray-600 transition-all p-1 ${
                          minDeadline
                            ? 'opacity-100 pointer-events-auto'
                            : 'opacity-0 pointer-events-none'
                        }`}
                        title="Clear delivery time"
                        aria-hidden={!minDeadline}
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                    <div className='flex flex-row gap-4 sm:flex-row sm:items-center'>
                      <div className='flex-1 w-1/2'>
                        <Input
                          type='number'
                          placeholder={`Minimum delivery time in ${selectedUnitTime.name}`}
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
                          className='w-full'
                        />
                      </div>
                      <div className='sm:w-40 w-1/2'>
                        <ListBox
                          placeholder='Select Time Units'
                          value={selectedUnitTime}
                          onChange={(unit) => {
                            if (typeof unit !== 'string') {
                              setSelectedUnitTime(unit);
                            }
                          }}
                          options={unitsDeliveryTime.map(unit => ({ id: unit.id.toString(), name: unit.name }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arbitrator Section */}
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='text-sm font-medium text-gray-700'>
                        Search for Arbitrator
                      </h3>
                      <button
                        onClick={handleClearArbitrator}
                        className={`text-gray-400 hover:text-gray-600 transition-all p-1 ${
                          selectedArbitratorAddress
                            ? 'opacity-100 pointer-events-auto'
                            : 'opacity-0 pointer-events-none'
                        }`}
                        title="Clear arbitrator"
                        aria-hidden={!selectedArbitratorAddress}
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                    <Combobox
                      placeholder='Select Arbitrator'
                      value={selectedArbitratorAddress || ''}
                      options={arbitratorAddresses.map(
                        (arbitratorAddress, index) => ({
                          value: arbitratorAddress,
                          label: `${arbitratorNames[index]} ${shortenText({ text: arbitratorAddress, maxLength: 11 })} ${+arbitratorFees[index] / 100}%`,
                        })
                      )}
                      onChange={(addr) =>
                        setSelectedArbitratorAddress(addr)
                      }
                    />
                  </div>
                </div>
                <div className='flex w-full sm:w-1/2 flex-col gap-y-3'>
                  {/* Tags Section */}
                  <div className='w-full'>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='text-sm font-medium text-gray-700'>Tags</h3>
                      <button
                        onClick={handleClearTags}
                        className={`text-gray-400 hover:text-gray-600 transition-all p-1 ${
                          tags.length > 0
                            ? 'opacity-100 pointer-events-auto'
                            : 'opacity-0 pointer-events-none'
                        }`}
                        title="Clear tags"
                        aria-hidden={tags.length === 0}
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                    <TagsInput tags={tags} setTags={setTags} />
                  </div>

                  {/* Creator Address Section */}
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='text-sm font-medium text-gray-700'>
                        Creator Address
                      </h3>
                      <button
                        onClick={handleClearCreatorAddress}
                        className={`text-gray-400 hover:text-gray-600 transition-all p-1 ${
                          creatorAddress
                            ? 'opacity-100 pointer-events-auto'
                            : 'opacity-0 pointer-events-none'
                        }`}
                        title="Clear creator address"
                        aria-hidden={!creatorAddress}
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                    <Input
                      placeholder='Enter Creator Address'
                      value={creatorAddress || ''}
                      onChange={(e) => setCreatorAddress(e.target.value || undefined)}
                      className='w-full'
                    />
                  </div>

                  {/* Multiple Applicants Section */}
                  <div className='flex w-full flex-col'>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='text-sm font-medium text-gray-700'>
                        Multiple Applicants
                      </h3>
                      <button
                        onClick={handleClearMultipleApplicants}
                        className={`text-gray-400 hover:text-gray-600 transition-all p-1 ${
                          typeof multipleApplicants !== 'undefined'
                            ? 'opacity-100 pointer-events-auto'
                            : 'opacity-0 pointer-events-none'
                        }`}
                        title="Clear selection"
                        aria-hidden={typeof multipleApplicants === 'undefined'}
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                    <RadioGroup
                      className='!mt-0 flex'
                      value={typeof multipleApplicants === 'undefined' ? '' : multipleApplicants ? 'Yes' : 'No'}
                      onChange={(value) =>
                        setMultipleApplicants(value === 'Yes')
                      }
                      aria-label='Multiple applicants selection'
                    >
                      {noYes.map((option) => (
                        <Field
                          className='!mt-0 mr-5 flex items-center'
                          key={option}
                        >
                          <Radio
                            className='mr-2'
                            color='default'
                            value={option}
                          >
                            <span>{option}</span>
                          </Radio>
                          <Label>{option}</Label>
                        </Field>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobFilter;
