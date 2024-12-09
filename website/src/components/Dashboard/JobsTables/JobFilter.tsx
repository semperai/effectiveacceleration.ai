import React, { useState } from 'react';
import { ComboBoxOption, Tag } from '@/service/FormsTypes';
import TagsInput from '@/components/TagsInput';
import { Radio, RadioGroup } from '@/components/Radio';
import { Input } from '@/components/Input';
import { Listbox, ListboxLabel, ListboxOption } from '@/components/Listbox';
import { TokenSelector } from '@/components/TokenSelector';
import { Token, tokens } from '@/tokens';
import { convertToSeconds, unitsDeliveryTime } from '@/utils/utils';
import {
  Description,
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from '@/components/Fieldset';

type JobFilterProps = {};

export const JobFilter = ({}: JobFilterProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    tokens[0]
  );
  const [minDeadline, setMinDeadline] = useState<number | undefined>();
  const [selectedUnitTime, setselectedUnitTime] = useState<ComboBoxOption>(
    unitsDeliveryTime[2]
  );

  return (
    <div className='mb-4 rounded-lg border border-gray-300 bg-white p-4 shadow-sm'>
      {/* Stack vertically on mobile, horizontal on larger screens */}
      <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
        <Field className='w-full'>
          <Input placeholder='Search' className='w-full' />
        </Field>
        <Field className='w-full'>
          <TagsInput tags={tags} setTags={setTags} />
        </Field>
      </div>

      {/* Stack sections vertically on mobile */}
      <div className='mt-4 flex flex-col items-start gap-4 lg:flex-row lg:items-center'>
        {/* Token and Minimum Tokens section */}
        <div className='flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center'>
          <Field className='w-full sm:w-auto'>
            <TokenSelector
              selectedToken={selectedToken}
              onClick={(token: Token) => setSelectedToken(token)}
            />
          </Field>
          <Field className='w-full sm:w-auto'>
            <Input
              type='number'
              className='w-full sm:w-40'
              placeholder='Minimum Tokens'
            />
          </Field>
        </div>

        {/* Delivery time section */}
        <div className='flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center'>
          <Field className='w-full'>
            <Input
              type='number'
              placeholder={`Minimum delivery time in ${selectedUnitTime.name}`}
              value={minDeadline}
              min={1}
              step={1}
              onChange={(e) => {
                let deadline = parseInt(e.target.value);
                if (deadline < 0) {
                  deadline = -deadline;
                }
                setMinDeadline(deadline);
              }}
            />
          </Field>
          <Field className='w-full sm:w-auto'>
            <Listbox
              placeholder='Time Units'
              value={selectedUnitTime}
              onChange={(e) => setselectedUnitTime(e)}
              className='w-full sm:w-auto'
            >
              {unitsDeliveryTime.map(
                (timeUnit, index) =>
                  index > 0 && (
                    <ListboxOption key={index} value={timeUnit}>
                      <ListboxLabel>
                        {unitsDeliveryTime[index].name}
                      </ListboxLabel>
                    </ListboxOption>
                  )
              )}
            </Listbox>
          </Field>
        </div>
      </div>
    </div>
  );
};
