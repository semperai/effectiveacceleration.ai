// TokenFilter.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TokenSelector } from '@/components/TokenSelector';
import type { Token } from '@/lib/tokens';

interface TokenFilterProps {
  selectedToken: Token | undefined;
  onTokenSelect: (token: Token | undefined) => void;
  minAmount: number | undefined;
  onMinAmountChange: (amount: number | undefined) => void;
  className?: string;
}

export const TokenFilter: React.FC<TokenFilterProps> = ({
  selectedToken,
  onTokenSelect,
  minAmount,
  onMinAmountChange,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localAmount, setLocalAmount] = useState<string>(
    minAmount?.toString() || ''
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local amount with prop
  useEffect(() => {
    setLocalAmount(minAmount?.toString() || '');
  }, [minAmount]);

  // Clear local amount when token is cleared externally
  useEffect(() => {
    if (!selectedToken) {
      setLocalAmount('');
    }
  }, [selectedToken]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string, numbers, and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setLocalAmount(value);

      // Update parent with parsed number or undefined
      if (value === '') {
        onMinAmountChange(undefined);
      } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          onMinAmountChange(numValue);
        }
      }
    }
  };

  const handleTokenSelect = (token: Token | undefined) => {
    onTokenSelect(token);
    if (!token) {
      // Clear amount when token is cleared
      setLocalAmount('');
      onMinAmountChange(undefined);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Main Container */}
      <div className='relative'>
        {/* Main input container */}
        <div
          className={`relative flex items-center rounded-lg border bg-white ${
            isFocused
              ? 'border-gray-300'
              : 'border-gray-200 hover:border-gray-300'
          } overflow-hidden`}
          style={{ height: '40px' }} // Fixed height matching PaymentInput
        >
          {/* Token Selector Section */}
          <div className='flex h-full flex-1 items-center'>
            {/* Token Selector - Compact mode matching PaymentInput - key forces remount on clear */}
            <TokenSelector
              key={selectedToken?.id || 'empty'}
              selectedToken={selectedToken}
              onClick={handleTokenSelect}
              persistSelection={false}
              compact={true}
            />
          </div>

          {/* Divider - only show when amount input is active */}
          {selectedToken && (
            <div className='mx-1 my-auto h-5 w-px bg-gray-200' />
          )}

          {/* Amount Input Section - only show when token is selected */}
          {selectedToken && (
            <div className='flex items-center pr-3'>
              {/* Amount input */}
              <input
                ref={inputRef}
                type='text'
                inputMode='decimal'
                value={localAmount}
                onChange={handleAmountChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={`Min amount`}
                className={`h-full w-28 border-0 bg-transparent px-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:outline-none focus:ring-0`}
                style={{
                  boxShadow: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenFilter;
