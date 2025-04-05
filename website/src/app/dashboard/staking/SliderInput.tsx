import React, { useEffect, useState } from 'react';
import { Slider } from "@/components/ui/slider";

interface SliderInputProps {
  value: string;
  onChange: (value: string) => void;
  onMaxClick: () => void;
  maxAmount: bigint;
  formatAmount: (amount: bigint) => string;
  parseAmount: (value: string) => bigint;
  label: string;
  placeholder?: string;
  className?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  value,
  onChange,
  onMaxClick,
  maxAmount,
  formatAmount,
  parseAmount,
  label,
  placeholder = "0.0",
  className = "",
}) => {
  const [sliderValue, setSliderValue] = useState<number>(0);
  const maxValue = parseFloat(formatAmount(maxAmount));

  // Update slider when input changes
  useEffect(() => {
    const inputValue = parseFloat(value || '0');
    const percentage = maxValue > 0 ? (inputValue / maxValue) * 100 : 0;
    setSliderValue(Math.min(percentage, 100));
  }, [value, maxValue]);

  // Handle slider change
  const handleSliderChange = (newValue: number[]) => {
    const percentage = newValue[0];
    const calculatedValue = (percentage / 100) * maxValue;
    
    // Format to 4 decimal places
    const formattedValue = calculatedValue.toFixed(4);
    onChange(formattedValue);
  };

  // Validate input to ensure it's numeric and within bounds
  const validateInput = (inputValue: string) => {
    // Remove non-numeric characters except decimal point
    const sanitizedValue = inputValue.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = sanitizedValue.split('.');
    const cleanValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');

    // Compare with max amount
    if (maxAmount && cleanValue) {
      try {
        const inputAmount = parseFloat(cleanValue);
        if (inputAmount > maxValue) {
          return maxValue.toString();
        }
      } catch (error) {
        console.error("Error comparing amounts:", error);
      }
    }

    return cleanValue;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(validateInput(e.target.value))}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4 border"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onMaxClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded"
        >
          MAX
        </button>
      </div>
      
      <div className="pt-2 px-1">
        <Slider
          defaultValue={[0]}
          value={[sliderValue]}
          max={100}
          step={0.1}
          onValueChange={handleSliderChange}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};
