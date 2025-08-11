import type { Tag } from '@/service/FormsTypes';
import type React from 'react';
import { type KeyboardEvent, useState, useRef } from 'react';
import { X, Plus } from 'lucide-react';

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
    <div className='rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-white/10 backdrop-blur-sm transition-all duration-200 hover:border-zinc-950/20 dark:hover:border-white/20'>
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
            className={`
              flex-1 w-full px-4 py-2.5 bg-transparent
              text-sm text-gray-900 dark:text-gray-100
              placeholder:text-gray-500 dark:placeholder:text-gray-400
              border-0 border-b !border-gray-200 dark:!border-white/10
              outline-none focus:outline-none focus:ring-0 focus:border-gray-200 dark:focus:border-white/10
              ${showAddButton ? 'pr-12' : 'pr-4'}
            `}
          />

          {/* Add button */}
          {showAddButton && (
            <button
              type='button'
              onClick={addTag}
              className='absolute right-2 group flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20 transition-all duration-200 hover:scale-105 active:scale-95'
              aria-label='Add tag'
            >
              <Plus className='h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300' />
            </button>
          )}
        </div>
      </div>

      {/* Tags display */}
      {tags.length > 0 && (
        <div className='px-3 py-3'>
          <div className='flex flex-wrap gap-2'>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => removeTag(tag.id)}
                className='group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-100/80 to-gray-50/80 dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 hover:from-red-50 hover:to-red-50/50 dark:hover:from-red-950/20 dark:hover:to-red-950/10 hover:border-red-200 dark:hover:border-red-800/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
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
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200'>
                  {tag.name}
                </span>
                <X className='h-3.5 w-3.5 text-gray-400 dark:text-gray-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-200' />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      {tags.length === 0 && (
        <div className='px-4 pb-3 pt-1'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Press Enter or comma to add tags
          </p>
        </div>
      )}
    </div>
  );
};

export default TagsInput;
