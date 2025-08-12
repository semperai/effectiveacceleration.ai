import React from 'react';
import { AlertCircle } from 'lucide-react';

const MinimalField = React.memo(
  ({
    children,
    error,
    icon,
    label,
    helperText,
    required,
  }: {
    children: React.ReactNode;
    error?: string;
    icon?: React.ReactNode;
    label?: string;
    helperText?: string;
    required?: boolean;
  }) => (
    <div className='group relative'>
      {label && (
        <div className='mb-2 flex items-center gap-2'>
          {icon && (
            <span
              className={`transition-colors duration-200 ${error ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}
            >
              {icon}
            </span>
          )}
          <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            {label}
            {required && (
              <span className='ml-1 text-base font-bold text-red-500'>*</span>
            )}
          </label>
        </div>
      )}
      <div className='relative'>{children}</div>
      {error && (
        <div className='mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' />
          <span>{error}</span>
        </div>
      )}
      {helperText && !error && (
        <p className='mt-1.5 text-xs text-gray-500 dark:text-gray-400'>
          {helperText}
        </p>
      )}
    </div>
  )
);

MinimalField.displayName = 'MinimalField';
export default MinimalField;
