import {
  Input as HeadlessInput,
  type InputProps as HeadlessInputProps,
} from '@headlessui/react';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

const dateTypes = ['date', 'datetime-local', 'month', 'time', 'week'];
type DateType = (typeof dateTypes)[number];

export const Input = forwardRef<
  HTMLInputElement,
  {
    type?:
      | 'email'
      | 'number'
      | 'password'
      | 'search'
      | 'tel'
      | 'text'
      | 'url'
      | DateType;
  } & HeadlessInputProps
>(function Input({ className, ...props }, ref) {
  return (
    <span
      data-slot='control'
      className={clsx([
        className,
        // Basic layout
        'relative block w-full',
        // Remove shadow and pseudo elements for cleaner look
        'before:hidden',
        // Remove focus ring pseudo element
        'after:hidden',
      ])}
    >
      <HeadlessInput
        ref={ref}
        className={clsx([
          // Date classes
          props.type &&
            dateTypes.includes(props.type) && [
              '[&::-webkit-datetime-edit-fields-wrapper]:p-0',
              '[&::-webkit-date-and-time-value]:min-h-[1.5em]',
              '[&::-webkit-datetime-edit]:inline-flex',
              '[&::-webkit-datetime-edit]:p-0',
              '[&::-webkit-datetime-edit-year-field]:p-0',
              '[&::-webkit-datetime-edit-month-field]:p-0',
              '[&::-webkit-datetime-edit-day-field]:p-0',
              '[&::-webkit-datetime-edit-hour-field]:p-0',
              '[&::-webkit-datetime-edit-minute-field]:p-0',
              '[&::-webkit-datetime-edit-second-field]:p-0',
              '[&::-webkit-datetime-edit-millisecond-field]:p-0',
              '[&::-webkit-datetime-edit-meridiem-field]:p-0',
            ],
          // Basic layout - updated to match PaymentInput
          'relative block w-full appearance-none rounded-lg px-3 h-10',
          // Typography - updated to match
          'text-sm text-gray-900 placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500',
          // Border - simplified to match PaymentInput
          'border border-gray-200 hover:border-gray-300 focus:border-gray-300',
          'dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-gray-600',
          // Background color - clean white
          'bg-white dark:bg-gray-800',
          // Transitions
          'transition-all duration-200',
          // Remove all focus rings and outlines
          'focus:outline-none focus:ring-0',
          // Invalid state - updated colors
          'data-[invalid]:border-red-300 data-[invalid]:focus:border-red-400',
          'data-[invalid]:dark:border-red-500 data-[invalid]:dark:focus:border-red-400',
          // Disabled state - updated
          'data-[disabled]:opacity-60 data-[disabled]:cursor-not-allowed',
          'data-[disabled]:bg-gray-50 data-[disabled]:dark:bg-gray-900',
          'data-[disabled]:border-gray-200 data-[disabled]:dark:border-gray-700',
        ])}
        style={{
          height: '40px',
          boxShadow: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none'
        }}
        {...props}
      />
    </span>
  );
});
