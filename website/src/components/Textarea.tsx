import {
  Textarea as HeadlessTextarea,
  type TextareaProps as HeadlessTextareaProps,
} from '@headlessui/react';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  { resizable?: boolean } & HeadlessTextareaProps
>(function Textarea({ className, resizable = true, ...props }, ref) {
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
      <HeadlessTextarea
        ref={ref}
        className={clsx([
          className,
          // Basic layout - updated to match PaymentInput styling
          'relative block w-full appearance-none rounded-lg px-3 py-2',
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
          'data-[invalid]:border-red-500 data-[invalid]:focus:border-red-500',
          'data-[invalid]:dark:border-red-500 data-[invalid]:dark:focus:border-red-500',
          // Disabled state - updated
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'disabled:bg-gray-50 disabled:dark:bg-gray-900',
          'disabled:border-gray-200 disabled:dark:border-gray-700',
          // Resizable
          resizable ? 'resize-y' : 'resize-none',
        ])}
        style={{
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
