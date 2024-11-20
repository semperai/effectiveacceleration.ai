import React from 'react';
import clsx from 'clsx';

interface Option {
  name: string;
  value: string | number;
}

interface CustomSelectProps {
  name: string;
  value: string | number | { id: string; name: string } | undefined;
  onChange: (value: string | number | { id: string; name: string }) => void;
  className?: string;
  children: React.ReactNode;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ name, value, onChange, className, children }) => {
  return (
    <select
      name={name}
      value={typeof value === 'object' && value !== null ? value.id : value}
      onChange={(e) => {
        const selectedValue = e.target.value;
        onChange(selectedValue);
      }}
      className={clsx([
        'relative !mt-1.1 block w-full text-darkBlueFont text-sm',
        'rounded-[calc(theme(borderRadius.xl)-1px)] bg-white shadow',
        'dark:bg-transparent',
        'focus:ring-primary focus:ring-inset focus:ring-transparent',
        'disabled:opacity-50 disabled:bg-zinc-950/5 disabled:shadow-none',
        'invalid:shadow-red-500/10',
        'border border-gray-300 shadow-sm z-99 mt-2',
        'h-10',
        className
      ])}
    >
      {children}
    </select>
  );
};

export default CustomSelect;