import type { Tag } from '@/service/FormsTypes';
import clsx from 'clsx';
import type React from 'react';
import { type KeyboardEvent, useState, useRef } from 'react';
import { IoIosClose } from 'react-icons/io';
import { MdAdd } from 'react-icons/md';

const TagsInput: React.FC<{ tags: Tag[]; setTags: (tags: Tag[]) => void }> = ({
  tags,
  setTags,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showAddButton, setShowAddButton] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // Show add button when there's text
    setShowAddButton(value.trim().length > 0);
  };

  const addTag = () => {
    if (inputValue.trim()) {
      const newTag: Tag = {
        id: Date.now(),
        name: inputValue.trim(),
      };
      setTags([...tags, newTag]);
      setInputValue('');
      setShowAddButton(false);
      // Keep focus on input for continuous adding
      inputRef.current?.focus();
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    // Also handle comma as a separator (common pattern)
    if (e.key === ',' && inputValue.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  // Handle space bar as tag separator (optional - you can remove this if not desired)
  const handleSpaceAsSeparator = (e: KeyboardEvent<HTMLInputElement>) => {
    // Uncomment the following lines if you want space to create tags
    // if (e.key === ' ' && inputValue.trim() && inputValue.trim().length > 2) {
    //   e.preventDefault();
    //   addTag();
    // }
  };

  const handleInputBlur = () => {
    // Optional: Auto-add tag on blur if there's content
    // This helps on mobile when users tap outside
    if (inputValue.trim()) {
      // Small delay to allow button click to register first
      setTimeout(() => {
        if (inputValue.trim()) {
          // Optionally show a confirmation or just add the tag
          // You might want to ask the user first
          // For now, we'll just keep the add button visible
        }
      }, 200);
    }
  };

  const removeTag = (tagId: number) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
  };

  return (
    <div className='mt-1.1 rounded-xl border border-zinc-950/20 bg-white shadow-sm data-[hover]:border-zinc-950/20'>
      <div className='relative'>
        <div className='relative flex items-center'>
          <input
            ref={inputRef}
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            placeholder='Add a tag...'
            className={clsx([
              // Basic layout
              `${tags.length > 0 ? '!rounded-b-none' : '!rounded-xl'}`,
              'relative !mt-0 block flex-1',
              showAddButton ? '!pr-12' : '!pr-4',
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

          {/* Add button for mobile */}
          {showAddButton && (
            <button
              type='button'
              onClick={addTag}
              className='absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition-all hover:bg-primary/90 active:scale-95'
              aria-label='Add tag'
            >
              <MdAdd className='text-xl' />
            </button>
          )}
        </div>
      </div>

      {/* Tags display */}
      {tags.length > 0 && (
        <ul className='px-2 py-1 pt-2'>
          {tags.map((tag) => (
            <li
              key={tag.id}
              className={clsx(
                'm-1 inline-flex cursor-pointer items-center rounded-full border-0 border-zinc-950/10 bg-softbluelight px-3 py-1 text-white transition-all hover:border-zinc-950/20 hover:bg-opacity-90 active:scale-95 active:border-zinc-950/20 dark:border-white/10 dark:group-data-[active]:border-white/20 dark:group-data-[hover]:border-white/20'
              )}
              onClick={() => removeTag(tag.id)}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  removeTag(tag.id);
                }
              }}
              aria-label={`Remove tag ${tag.name}`}
            >
              <span className='text-sm font-medium text-darkBlueFont'>
                {tag.name}
              </span>
              <IoIosClose
                className={clsx(
                  'ml-1 text-xl font-light text-darkBlueFont'
                )}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Optional: Suggested tags for quick addition */}
      {/* Uncomment and customize if you want to show suggested tags
      {suggestedTags && suggestedTags.length > 0 && (
        <div className='border-t border-gray-200 px-2 py-2'>
          <span className='text-xs text-gray-500'>Suggestions:</span>
          <div className='mt-1'>
            {suggestedTags.map((suggestion) => (
              <button
                key={suggestion}
                type='button'
                onClick={() => {
                  const newTag: Tag = {
                    id: Date.now(),
                    name: suggestion,
                  };
                  setTags([...tags, newTag]);
                }}
                className='m-1 inline-block rounded-full border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:border-primary hover:text-primary'
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default TagsInput;
