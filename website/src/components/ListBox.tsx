import type React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ListBoxProps {
  placeholder: string;
  value: string | { id: string; name: string } | undefined;
  onChange: (value: string | { id: string; name: string }) => void;
  options: { id: string; name: string }[];
}

const ListBox: React.FC<ListBoxProps> = ({
  placeholder,
  value,
  onChange,
  options,
}) => {
  return (
    <Select
      value={typeof value === 'string' ? value : value?.id}
      onValueChange={(id) => {
        const selectedOption = options.find((option) => option.id === id);
        if (selectedOption) {
          onChange(selectedOption);
        } else {
          onChange(id);
        }
      }}
    >
      <SelectTrigger
        className='w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 focus:border-gray-300 focus:ring-0 focus:ring-offset-0 data-[state=open]:border-gray-300'
        style={{
          height: '40px',
          boxShadow: 'none',
          marginTop: '0',
        }}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className='rounded-lg border-gray-200'>
        {options.map((option) => (
          <SelectItem
            className='rounded text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50'
            key={option.id}
            value={option.id}
          >
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ListBox;
