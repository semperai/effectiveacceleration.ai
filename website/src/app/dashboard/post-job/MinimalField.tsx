import React from 'react';
import { Label } from '@/components/Fieldset';
import { PiWarningCircle } from 'react-icons/pi';
import { AlertCircle } from 'lucide-react';

const MinimalField = React.memo(({
  children,
  error,
  icon,
  label,
  helperText,
  required
}: {
  children: React.ReactNode;
  error?: string;
  icon?: React.ReactNode;
  label?: string;
  helperText?: string;
  required?: boolean;
}) => (
  <div className='relative group'>
    {label && (
      <div className='flex items-center gap-2 mb-2'>
        {icon && <span className={`transition-colors duration-200 ${error ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>{icon}</span>}
        <Label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
          {label}
          {required && <span className='ml-1 text-red-500 font-bold text-base'>*</span>}
        </Label>
      </div>
    )}
    <div className='relative'>
      <div className={`
        relative rounded-xl transition-all duration-300
        ${error ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}
      `}>
        {error && (
          <div className='absolute -top-3 -right-3 z-20'>
            <div className='relative'>
              <span className='absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75' />
              <span className='relative flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg'>
                <PiWarningCircle className='h-4 w-4' />
              </span>
            </div>
          </div>
        )}

        <div className={`rounded-xl transition-all duration-200 ${error ? 'bg-red-50/50 dark:bg-red-950/20' : ''}`}>
          {children}
        </div>
      </div>
    </div>

    {error && (
      <div className='mt-2.5 flex items-center gap-2'>
        <div className='flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400'>
          <AlertCircle className='h-4 w-4 flex-shrink-0 animate-pulse' />
          <span>{error}</span>
        </div>
      </div>
    )}

    {helperText && !error && (
      <p className='mt-1.5 text-xs text-gray-500 dark:text-gray-400'>{helperText}</p>
    )}
  </div>
));

MinimalField.displayName = 'MinimalField';

export default MinimalField;
