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
  const [isFocused, setIsFocused] = useState(false);
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
    setIsFocused(false);
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
    <div
      className={`rounded-lg border bg-white transition-all duration-200 ${isFocused ? 'border-gray-300' : 'border-gray-200 hover:border-gray-300'} `}
    >
      <div className='relative'>
        <div
          className='relative flex items-center'
          style={{ minHeight: '40px' }}
        >
          <input
            ref={inputRef}
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={handleInputBlur}
            placeholder='Add a tag...'
            className={`w-full flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:outline-none focus:ring-0 ${showAddButton ? 'pr-12' : 'pr-4'} `}
            style={{
              height: '40px',
              borderBottom: '1px solid rgb(229 231 235)',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              boxShadow: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
            }}
          />

          {/* Add button */}
          {showAddButton && (
            <button
              type='button'
              onClick={addTag}
              className='group absolute right-2 flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 transition-all duration-200 hover:scale-105 hover:from-blue-500/20 hover:to-purple-500/20 active:scale-95'
              aria-label='Add tag'
            >
              <Plus className='h-4 w-4 text-blue-600 group-hover:text-blue-500' />
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
                className='group inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 transition-all duration-200 hover:scale-[1.02] hover:border-red-200 hover:bg-red-50 active:scale-[0.98]'
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
                <span className='text-sm font-medium text-gray-700 transition-colors duration-200 group-hover:text-red-600'>
                  {tag.name}
                </span>
                <X className='h-3.5 w-3.5 text-gray-400 transition-colors duration-200 group-hover:text-red-500' />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      {tags.length === 0 && (
        <div className='px-3 pb-3 pt-3'>
          <p className='text-xs text-gray-500'>
            Press Enter or comma to add tags
          </p>
        </div>
      )}
    </div>
  );
};

export default TagsInput;
