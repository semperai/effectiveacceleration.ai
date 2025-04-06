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
  // Local state to track slider value during user interaction
  const [localValue, setLocalValue] = useState(lockupPeriod);
  
  // Track if user is interacting with the slider
  const isInteracting = useRef(false);
  
  // Store the last value that was committed to the parent
  const lastCommittedValue = useRef(lockupPeriod);
  
  // Reference to the timeout for debouncing
  const debouncedUpdateTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync with external state, but only when not actively interacting
  useEffect(() => {
    if (!isInteracting.current) {
      setLocalValue(lockupPeriod);
      lastCommittedValue.current = lockupPeriod;
    }
  }, [lockupPeriod]);

  // Handle slider change - only update local state
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    isInteracting.current = true;
    setLocalValue(newValue);
  };

  // Handle when user finishes interacting with the slider
  const handleSliderCommit = () => {
    // Only update parent if the value has actually changed
    if (localValue !== lastCommittedValue.current) {
      lastCommittedValue.current = localValue;
      
      // Update the parent component with the new value
      setLockupPeriod(localValue);
    }
    
    // Reset interaction state after a short delay
    setTimeout(() => {
      isInteracting.current = false;
    }, 100);
  };

  return (
    <div className="mb-6">
      <input
        type="range"
        min={min}
        max={max}
        value={localValue}
        onChange={handleSliderChange}
        onMouseUp={handleSliderCommit}
        onTouchEnd={handleSliderCommit}
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
