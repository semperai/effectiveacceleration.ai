import React, { useState, useRef, useEffect } from 'react';

interface LockupSliderProps {
  lockupPeriod: number;
  setLockupPeriod: (period: number) => void;
  min?: number;
  max?: number;
  ticks?: { value: number; label: string }[];
}

export const LockupSlider: React.FC<LockupSliderProps> = ({
  lockupPeriod,
  setLockupPeriod,
  min = 52,
  max = 208,
  ticks = [
    { value: 52, label: '1 Year' },
    { value: 104, label: '2 Years' },
    { value: 156, label: '3 Years' },
    { value: 208, label: '4 Years' }
  ]
}) => {
  // Local state to track user interaction
  const [localValue, setLocalValue] = useState(lockupPeriod);
  const isUserInteracting = useRef(false);
  const debouncedUpdateTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync with external state when not interacting
  useEffect(() => {
    if (!isUserInteracting.current) {
      setLocalValue(lockupPeriod);
    }
  }, [lockupPeriod]);

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    isUserInteracting.current = true;
    setLocalValue(newValue);

    // Debounce the update to parent to prevent excessive RPC calls
    if (debouncedUpdateTimer.current) {
      clearTimeout(debouncedUpdateTimer.current);
    }

    debouncedUpdateTimer.current = setTimeout(() => {
      setLockupPeriod(newValue);
      // Reset interaction flag after update
      setTimeout(() => {
        isUserInteracting.current = false;
      }, 100);
    }, 300); // 300ms debounce time
  };

  return (
    <div className="mb-6">
      <input
        type="range"
        min={min}
        max={max}
        value={localValue}
        onChange={handleSliderChange}
        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />

      <div className="relative h-10 mt-1">
        {/* Ticks for lockup period */}
        <div className="absolute inset-x-0 flex justify-between">
          {ticks.map((tick, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="h-3 w-1 bg-gray-300"></div>
              <span className="text-xs text-gray-500 mt-1">{tick.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
