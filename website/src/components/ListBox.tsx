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
      <SelectTrigger className="w-full rounded-xl focus:ring-offset-0 focus:ring-primary focus:ring-1 ring-blue-500">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className='rounded-xl'>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ListBox;
