import { Tag } from '@/service/FormsTypes';
import clsx from 'clsx';
import React, { KeyboardEvent, useState } from 'react';
import { IoIosClose } from 'react-icons/io';

const TagsInput: React.FC<{ tags: Tag[]; setTags: (tags: Tag[]) => void }> = ({
  tags,
  setTags,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      // Prevent form submission if wrapped in a form
      e.preventDefault();
      // Add the new tag to the tags array
      const newTag: Tag = {
        id: Date.now(), // Simple unique id generator
        name: inputValue.trim(),
      };
      setTags([...tags, newTag]);
      // Reset input field
      setInputValue('');
    }
  };

  return (
    <div className='mt-1.1 rounded-xl border border-zinc-950/20 bg-white shadow-sm data-[hover]:border-zinc-950/20'>
      <div className='h-0 w-full text-right'>
        <span className='relative right-4 top-[11.2px] text-sm text-gray-400'>
          Press enter to add tag
        </span>
      </div>

      <input
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        className={clsx([
          // Basic layout
          `${tags.length > 0 ? '!rounded-b-none' : '!rounded-xl'}`,
          'relative !mt-0 block w-full !pr-[25%]',
          'w-full border-0 border-b border-gray-200 text-sm',
          // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
          'before: rounded-xl',
          // Basic layout
          'relative block w-full appearance-none px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2])-1px)] sm:px-[calc(theme(spacing[3])-1px)] sm:py-[calc(theme(spacing[2])-1px)]',

          // Typography
          'text-base/6 text-darkBlueFont placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',

          // Border
          'border border-zinc-950/10 focus:border-white data-[hover]:border-zinc-950/20 dark:border-white/10 dark:data-[hover]:border-white/20',

          // Background color
          'bg-transparent dark:bg-white/5',

          // Hide default focus styles
          'focus:outline-none focus:ring-1 focus:ring-primary',

          // Invalid state
          'data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500 data-[invalid]:dark:border-red-500 data-[invalid]:data-[hover]:dark:border-red-500',

          // Disabled state
          'data-[disabled]:border-zinc-950/20 dark:data-[hover]:data-[disabled]:border-white/15 data-[disabled]:dark:border-white/15 data-[disabled]:dark:bg-white/[2.5%]',
        ])}
      />
      {tags.length > 0 && (
        <ul className='px-2 py-1 pt-2'>
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={clsx(
                'm-1 inline cursor-pointer rounded-full border-0 border-zinc-950/10 bg-softbluelight pb-1 pl-3 pr-1 text-white hover:border-zinc-950/20 active:border-zinc-950/20 dark:border-white/10 dark:group-data-[active]:border-white/20 dark:group-data-[hover]:border-white/20'
              )}
              onClick={() => setTags(tags.filter((p) => p.id !== tag.id))}
            >
              <span className='mb-2 inline-block text-sm font-medium text-darkBlueFont'>
                {tag.name}
              </span>
              <IoIosClose
                className={clsx(
                  'ml-1 inline text-xl font-light text-darkBlueFont'
                )}
              />
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagsInput;
