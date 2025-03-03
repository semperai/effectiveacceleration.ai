import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ListBoxProps {
  placeholder: string;
  value: string | { id: string; name: string } | undefined;
  onChange: (value: string | { id: string; name: string }) => void;
  options: { id: string; name: string }[];
}

const ListBox: React.FC<ListBoxProps> = ({ placeholder, value, onChange, options }) => {
  return (
    <Select value={typeof value === 'string' ? value : value?.id} onValueChange={(id) => {
      const selectedOption = options.find(option => option.id === id);
      if (selectedOption) {
        onChange(selectedOption);
      } else {
        onChange(id);
      }
    }}>
      <SelectTrigger className="w-full rounded-xl border-gray-300 focus:ring-offset-0 focus:ring-primary focus:ring-1 ring-blue-500 border data-[hover]:border-zinc-950/20 dark:border-white/10 dark:data-[hover]:border-white/20 mt-[7px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className='rounded-xl'>
        {options.map((option) => (
          <SelectItem className='rounded-lg' key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ListBox;
