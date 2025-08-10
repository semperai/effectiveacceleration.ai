// src/components/DeliveryTimelineInput/index.tsx
'use client';

import React, { useState, useRef } from 'react';
import { AlertCircle, ChevronDown, Clock } from 'lucide-react';
import moment from 'moment';

interface TimeUnit {
  id: string;
  name: string;
  plural: string;
  seconds: number;
}

const timeUnits: TimeUnit[] = [
  { id: '1', name: 'Minutes', plural: 'Minutes', seconds: 60 },
  { id: '2', name: 'Hours', plural: 'Hours', seconds: 3600 },
  { id: '3', name: 'Days', plural: 'Days', seconds: 86400 },
  { id: '4', name: 'Weeks', plural: 'Weeks', seconds: 604800 },
];

interface DeliveryTimelineInputProps {
  value: number;
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
}

export const DeliveryTimelineInput: React.FC<DeliveryTimelineInputProps> = ({
  value,
  onValueChange,
  selectedUnit,
  onUnitChange,
  error,
  placeholder = "Enter time",
  label,
  helperText,
  disabled = false,
  required = false,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only positive numbers
    if (val === '' || /^\d+$/.test(val)) {
      onValueChange(val);
    }
  };

  const handleUnitSelect = (unit: TimeUnit) => {
    onUnitChange({ id: unit.id, name: unit.name });
    setIsDropdownOpen(false);
  };

  // Calculate human-readable duration
  const getHumanReadableDuration = () => {
    if (!value || isNaN(value) || value === 0) return null;
    
    // Find the actual unit to get the seconds multiplier
    const unit = timeUnits.find(u => u.name === selectedUnit.name);
    if (!unit) return null;
    
    // Calculate total seconds
    const totalSeconds = value * unit.seconds;
    return moment.duration(totalSeconds, 'seconds').humanize();
  };

  const humanReadable = getHumanReadableDuration();

  // Get plural or singular form
  const getUnitLabel = () => {
    const unit = timeUnits.find(u => u.id === selectedUnit.id);
    if (!unit) return selectedUnit.name;
    return value === 1 ? unit.name : unit.plural;
  };

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
            ${error 
              ? 'border-red-300 focus-within:border-red-400' 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
          style={{ height: '40px' }}
        >
          {/* Time Icon */}
          <div className="pl-3 pr-2">
            <Clock className="h-4 w-4 text-gray-400" />
          </div>

          {/* Number Input */}
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
              focus:outline-none border-0
              disabled:cursor-not-allowed
            "
          />

          {/* Divider */}
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
                  {timeUnits.map((unit) => (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => handleUnitSelect(unit)}
                      className={`
                        w-full px-3 py-2 text-left text-sm
                        transition-colors duration-150
                        ${selectedUnit.id === unit.id 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {value === 1 ? unit.name : unit.plural}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Human readable duration */}
        {humanReadable && !error && (
          <div className="text-xs text-gray-500 px-1">
            Duration: <span className="font-medium text-gray-700">{humanReadable}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-1 text-xs text-red-600 px-1">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <p className="text-xs text-gray-500 px-1">{helperText}</p>
        )}
      </div>
    </div>
  );
};

export default DeliveryTimelineInput;
