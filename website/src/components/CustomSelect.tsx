import type React from 'react';
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

const CustomSelect: React.FC<CustomSelectProps> = ({
  name,
  value,
  onChange,
  className,
  children,
}) => {
  return (
    <select
      name={name}
      value={typeof value === 'object' && value !== null ? value.id : value}
      onChange={(e) => {
        const selectedValue = e.target.value;
        onChange(selectedValue);
      }}
      className={clsx([
        'relative !mt-1.1 block w-full text-sm text-darkBlueFont',
        'rounded-[calc(theme(borderRadius.xl)-1px)] bg-white shadow',
        'dark:bg-transparent',
        'focus:ring-inset focus:ring-primary focus:ring-transparent',
        'disabled:bg-zinc-950/5 disabled:opacity-50 disabled:shadow-none',
        'invalid:shadow-red-500/10',
        'z-99 mt-2 border border-gray-300 shadow-sm',
        'h-10',
        className,
      ])}
    >
      {children}
    </select>
  );
};

export default CustomSelect;
