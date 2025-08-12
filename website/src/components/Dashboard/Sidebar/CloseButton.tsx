'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

interface CloseButtonProps {
  onClick: () => void;
}

export const CloseButton = ({ onClick }: CloseButtonProps) => {
  return (
    <button
      type='button'
      className='rounded-lg p-1.5 text-gray-400 transition-all duration-200 hover:bg-white/10 hover:text-white'
      onClick={onClick}
    >
      <XMarkIcon className='h-5 w-5' />
    </button>
  );
};
