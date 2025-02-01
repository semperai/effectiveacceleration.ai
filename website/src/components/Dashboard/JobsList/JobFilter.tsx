import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';
import { Input } from '@/components/Input';
import { Listbox, ListboxLabel, ListboxOption } from '@/components/Listbox';
import { Separator } from '@/components/Separator';
import TagsInput from '@/components/TagsInput';
import { TokenSelector } from '@/components/TokenSelector';
import { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { Token } from '@/tokens';
import { shortenText, unitsDeliveryTime } from '@/utils/utils';
import { Field, Label } from '@headlessui/react';
import { Radio, RadioGroup } from '@/components/Radio';
import { ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';
import React, { useState } from 'react';

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
  multipleApplicants: boolean;
  setMultipleApplicants: React.Dispatch<React.SetStateAction<boolean>>;
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
              <div className='flex gap-x-16'>
                <div className='flex flex-col w-1/2 gap-y-3'>
                    <div className='w-full'>
                      <h3 className='text-sm font-medium text-gray-700'>
                        Tags
                      </h3>
                      <TagsInput tags={tags} setTags={setTags} />
                    </div>
                    <div className='flex w-full flex-row items-center justify-between'>
                        <h3 className='text-sm font-medium text-gray-700'>
                          Multiple Applicants
                        </h3>
                        <RadioGroup
                          className='!mt-0 flex'
                          value={multipleApplicants ? 'Yes' : 'No'}
                          onChange={(value) =>
                            setMultipleApplicants(value === 'Yes')
                          }
                          aria-label='Server size'
                        >
                          {noYes.map((option) => (
                            <Field
                              className='!mt-0 ml-5 flex items-center'
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
                <div className='flex flex-col w-1/2 gap-y-3'>
                  {/* Token Settings Section */}
                  <div className=''>
                    <h3 className='text-sm font-medium text-gray-700'>
                      Token Settings
                    </h3>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                      <div className='flex-1'>
                        <TokenSelector
                          selectedToken={selectedToken}
                          onClick={setSelectedToken}
                        />
                      </div>
                      <div className='w-full sm:w-40'>
                        <Input
                          type='number'
                          value={minTokens}
                          onChange={(e) => setMinTokens(Number(e.target.value))}
                          placeholder='Min. tokens'
                          className='w-full'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Time Section */}
                  <div className=''>
                    <h3 className='text-sm font-medium text-gray-700'>
                      Delivery Time
                    </h3>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                      <div className='flex-1'>
                        <Input
                          type='number'
                          placeholder={`Minimum delivery time in ${selectedUnitTime.name}`}
                          value={minDeadline}
                          min={1}
                          step={1}
                          onChange={(e) => {
                            let deadline = Math.abs(parseInt(e.target.value));
                            setMinDeadline(deadline);
                          }}
                          className='w-full'
                        />
                      </div>
                      <div className='w-full sm:w-40'>
                        <Listbox
                          placeholder='Time Units'
                          value={selectedUnitTime}
                          onChange={setSelectedUnitTime}
                          className='w-full'
                        >
                          {unitsDeliveryTime.map(
                            (timeUnit, index) =>
                              index > 0 && (
                                <ListboxOption key={index} value={timeUnit}>
                                  <ListboxLabel>{timeUnit.name}</ListboxLabel>
                                </ListboxOption>
                              )
                          )}
                        </Listbox>
                      </div>
                    </div>
                  </div>
                  <div>
                      <h3 className='mb-2 text-sm font-medium text-gray-700'>
                        Search for Arbitrator
                      </h3>
                      <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                        <div className='flex-1'>
                          <Listbox
                            placeholder='Select Arbitrator'
                            value={selectedArbitratorAddress}
                            onChange={(addr) =>
                              setSelectedArbitratorAddress(addr)
                            }
                          >
                            {arbitratorAddresses.map(
                              (arbitratorAddress, index) =>
                                index > 0 && (
                                  <ListboxOption
                                    key={index}
                                    value={arbitratorAddress}
                                  >
                                    <ListboxLabel>
                                      <span className=''>
                                        {arbitratorNames[index]}
                                      </span>{' '}
                                      <span className='ml-4 text-sm text-gray-500'>
                                        {shortenText({
                                          text: arbitratorAddress,
                                          maxLength: 11,
                                        })}
                                      </span>{' '}
                                      <span className='bold ml-4'>
                                        {+arbitratorFees[index] / 100}%
                                      </span>
                                    </ListboxLabel>
                                  </ListboxOption>
                                )
                            )}
                          </Listbox>
                        </div>
                        <div className='flex-1'>
                          <Input
                            placeholder='Enter Creator Address'
                            value={creatorAddress}
                            onChange={(e) => setCreatorAddress(e.target.value)}
                            className='w-full'
                          />
                        </div>
                      </div>
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
