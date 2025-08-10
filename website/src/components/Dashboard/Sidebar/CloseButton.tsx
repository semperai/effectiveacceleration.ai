'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

interface CloseButtonProps {
  onClick: () => void;
}

export const CloseButton = ({ onClick }: CloseButtonProps) => {
  return (
    <button
      type='button'
      className='p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200'
      onClick={onClick}
    >
      <XMarkIcon className='h-5 w-5' />
    </button>
  );
};

