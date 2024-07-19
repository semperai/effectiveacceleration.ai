import { Input } from '@/components/Input'
import clsx from 'clsx';
import React, { useState, KeyboardEvent } from 'react';
import { IoIosClose } from 'react-icons/io';

interface Tag {
  id: number;
  name: string;
}

const TagsInput: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
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
    <div className='border border-zinc-950/20 data-[hover]:border-zinc-950/20  rounded-xl bg-white shadow-sm mt-1.1'>
      <div className='w-full h-0 text-right '>
        <span className='text-sm relative top-[11.2px] right-4 text-gray-400'>Press enter to add tag</span>
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        className={clsx([
            // Basic layout
            `${tags.length > 0 ? '!rounded-b-none' : '!rounded-xl'}`,
            'relative block w-full !mt-0',
            'w-full border-0  border-b border-gray-200 text-sm',
            // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
            'before: rounded-xl',
          // Basic layout
          'relative block w-full appearance-none px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing[3])-1px)] sm:py-[calc(theme(spacing[3])-1px)]',

          // Typography
          'text-base/6 text-darkBlueFont placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',

          // Border
          'border border-zinc-950/10 data-[hover]:border-zinc-950/20 dark:border-white/10 dark:data-[hover]:border-white/20 focus:border-white',

          // Background color
          'bg-transparent dark:bg-white/5',

          // Hide default focus styles
          'focus:outline-none focus:ring-1  focus:ring-primary',

          // Invalid state
          'data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500 data-[invalid]:dark:border-red-500 data-[invalid]:data-[hover]:dark:border-red-500',

          // Disabled state
          'data-[disabled]:border-zinc-950/20 dark:data-[hover]:data-[disabled]:border-white/15 data-[disabled]:dark:border-white/15 data-[disabled]:dark:bg-white/[2.5%]',
          ])}
      />
      { tags.length > 0 && 
      <ul className='px-2 py-4 pt-5'>
        {tags.map(tag => (
            <div
                key={tag.id}
                className={clsx("bg-softbluelight text-white border-0 pl-3 pr-1 pb-1 m-1 cursor-pointer rounded-full inline border-zinc-950/10 active:border-zinc-950/20 hover:border-zinc-950/20 dark:border-white/10 dark:group-data-[active]:border-white/20 dark:group-data-[hover]:border-white/20")}
                onClick={() => setTags(tags.filter((p) => p.id !== tag.id))}
            >
                <span className='text-darkBlueFont text-sm font-medium inline-block mb-2 '>
                    {tag.name}
                </span>
                <IoIosClose className={clsx('ml-1 font-light text-darkBlueFont inline text-xl')} />
            </div>
        ))}
      </ul>
      }
    </div>
  );
};

export default TagsInput;