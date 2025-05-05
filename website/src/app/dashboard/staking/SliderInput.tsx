import React, { useEffect, useState, useRef } from 'react';
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
  // Local state for the input and slider values
  const [localInputValue, setLocalInputValue] = useState<string>(value);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const isUserInteracting = useRef(false);
  const lastCommittedValue = useRef(value);
  const maxValue = parseFloat(formatAmount(maxAmount));

  // Sync local state with external value, but only when not interacting
  useEffect(() => {
    if (!isUserInteracting.current) {
      setLocalInputValue(value);
      lastCommittedValue.current = value;
      const inputValue = parseFloat(value || '0');
      const percentage = maxValue > 0 ? (inputValue / maxValue) * 100 : 0;
      setSliderValue(Math.min(percentage, 100));
    }
  }, [value, maxValue]);

  // Force update slider when maxAmount changes
  useEffect(() => {
    const inputValue = parseFloat(localInputValue || '0');
    const percentage = maxValue > 0 ? (inputValue / maxValue) * 100 : 0;
    setSliderValue(Math.min(percentage, 100));
  }, [maxValue]);

  // Handle slider change - update local state only without parent notification
  const handleSliderChange = (newValue: number[]) => {
    isUserInteracting.current = true;
    const percentage = newValue[0];
    const calculatedValue = (percentage / 100) * maxValue;

    // Format to 4 decimal places
    const formattedValue = calculatedValue.toFixed(4);
    setLocalInputValue(formattedValue);
    setSliderValue(percentage);
  };

  // Commit value to parent only when slider interaction ends
  const handleSliderCommit = () => {
    if (localInputValue !== lastCommittedValue.current) {
      lastCommittedValue.current = localInputValue;
      onChange(localInputValue);
    }

    // Wait a bit before allowing syncing from parent again
    setTimeout(() => {
      isUserInteracting.current = false;
    }, 100);
  };

  // Handle text input change - only local update
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserInteracting.current = true;
    const inputValue = validateInput(e.target.value);
    setLocalInputValue(inputValue);

    // Update slider position
    const numericValue = parseFloat(inputValue || '0');
    const percentage = maxValue > 0 ? (numericValue / maxValue) * 100 : 0;
    setSliderValue(Math.min(percentage, 100));
  };

  // Commit input value on blur
  const handleInputBlur = () => {
    if (localInputValue !== lastCommittedValue.current) {
      lastCommittedValue.current = localInputValue;
      onChange(localInputValue);
    }

    // Wait a bit before allowing syncing from parent again
    setTimeout(() => {
      isUserInteracting.current = false;
    }, 100);
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

  // Handle max button click - this should directly go to parent
  const handleMaxClick = () => {
    isUserInteracting.current = false; // Allow parent update to come in
    onMaxClick();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={localInputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="block w-full rounded-lg border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleMaxClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded hover:bg-blue-200 transition-colors"
        >
          MAX
        </button>
      </div>

      <div className="pt-2 px-1">
        <Slider
          value={[sliderValue]}
          max={100}
          step={0.1}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
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
