'use client';

import React, { useState, useRef } from 'react';
import { AlertCircle, ChevronDown, Clock } from 'lucide-react';

interface TimeUnit {
  id: string;
  name: string;
  plural: string;
  seconds: number;
}

const timeUnits: TimeUnit[] = [
  { id: '1', name: 'Minute', plural: 'Minutes', seconds: 60 },
  { id: '2', name: 'Hour', plural: 'Hours', seconds: 3600 },
  { id: '3', name: 'Day', plural: 'Days', seconds: 86400 },
  { id: '4', name: 'Week', plural: 'Weeks', seconds: 604800 },
];

interface DeliveryTimelineInputProps {
  value: number | string;
  onValueChange: (value: string) => void;
  selectedUnit: { id: string; name: string };
  onUnitChange: (unit: { id: string; name: string }) => void;
  error?: string;
  placeholder?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  min?: number;
  max?: number;
}

export const DeliveryTimelineInput: React.FC<DeliveryTimelineInputProps> = ({
  value,
  onValueChange,
  selectedUnit,
  onUnitChange,
  error,
  placeholder = "0",
  label,
  helperText,
  disabled = false,
  required = false,
  className = '',
  min = 0,
  max,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only positive numbers
    if (val === '' || /^\d+$/.test(val)) {
      onValueChange(val);
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    }
  };

  const handleUnitSelect = (unit: TimeUnit) => {
    onUnitChange({ id: unit.id, name: unit.name });
    setIsDropdownOpen(false);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  // Parse value to number for calculations
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  const isValidValue = !isNaN(numValue) && numValue > 0;

  // Get plural or singular form based on current value
  const getUnitLabel = () => {
    const unit = timeUnits.find(u => 
      u.id === selectedUnit.id || 
      u.name === selectedUnit.name ||
      u.plural === selectedUnit.name
    );
    if (!unit) return selectedUnit.name;
    return numValue === 1 ? unit.name : unit.plural;
  };

  // Validate value against min/max
  const isValueValid = () => {
    if (!hasInteracted || !isValidValue) return true;
    if (min !== undefined && numValue < min) return false;
    if (max !== undefined && numValue > max) return false;
    return true;
  };

  const showValidationError = hasInteracted && !isValueValid();
  const validationErrorMsg = !isValidValue 
    ? 'Please enter a valid time'
    : min !== undefined && numValue < min 
      ? `Minimum is ${min}`
      : max !== undefined && numValue > max 
        ? `Maximum is ${max}`
        : '';
  
  const displayError = error || (showValidationError ? validationErrorMsg : '');

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Main Input Container */}
      <div className="space-y-1.5">
        <div 
          className={`
            relative flex items-center rounded-lg border bg-white
            transition-all duration-200
            ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}
            ${displayError 
              ? 'border-red-300 focus-within:border-red-400' 
              : isFocused
                ? 'border-gray-300'
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
          style={{ height: '40px' }}
        >
          {/* Time Icon */}
          <div className="pl-3 pr-2">
            <Clock className="h-4 w-4 text-gray-400" />
          </div>

          {/* Number Input - Remove all borders and outlines */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={value || ''}
            onChange={handleValueChange}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className="
              flex-1 pr-2 h-full
              bg-transparent
              text-sm text-gray-900 placeholder-gray-400
              border-0 outline-none focus:outline-none focus:ring-0
              disabled:cursor-not-allowed
            "
            style={{ 
              boxShadow: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none'
            }}
          />

          {/* Divider - Soft gray */}
          <div className="h-5 w-px bg-gray-200 mr-1" />

          {/* Unit Selector */}
          <div className="relative h-full">
            <button
              type="button"
              onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
              disabled={disabled}
              className={`
                h-full px-3 flex items-center gap-2
                rounded-r-lg transition-colors duration-150
                ${disabled ? 'cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
              `}
              style={{ minWidth: '100px' }}
            >
              <span className="text-sm font-medium text-gray-700">
                {getUnitLabel()}
              </span>
              <ChevronDown className={`
                h-4 w-4 text-gray-500 transition-transform duration-200
                ${isDropdownOpen ? 'rotate-180' : ''}
              `} />
            </button>

            {/* Dropdown */}
            {isDropdownOpen && !disabled && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                
                {/* Dropdown Menu */}
                <div 
                  ref={dropdownRef}
                  className="
                    absolute right-0 top-full mt-1 z-20
                    w-32 bg-white rounded-lg shadow-lg
                    border border-gray-200 py-1
                  "
                >
                  {timeUnits.map((unit) => {
                    const isSelected = selectedUnit.id === unit.id || 
                                     selectedUnit.name === unit.name || 
                                     selectedUnit.name === unit.plural;
                    return (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => handleUnitSelect(unit)}
                        className={`
                          w-full px-3 py-2 text-left text-sm
                          transition-colors duration-150
                          ${isSelected
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        {numValue === 1 ? unit.name : unit.plural}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error - Only show after interaction */}
        {displayError && (
          <div className="flex items-center gap-1 text-xs text-red-600 px-1">
            <AlertCircle className="h-3 w-3" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Helper text */}
        {!displayError && helperText && (
          <p className="text-xs text-gray-500 px-1">{helperText}</p>
        )}
      </div>
    </div>
  );
};

export default DeliveryTimelineInput;
