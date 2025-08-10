// src/components/PaymentInput/index.tsx
'use client';

import React, { useState, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { TokenSelector } from '@/components/TokenSelector';
import { type Token } from '@/tokens';

interface PaymentInputProps {
  amount: string;
  onAmountChange: (value: string) => void;
  selectedToken?: Token;
  onTokenSelect: (token: Token) => void;
  balance?: string;
  error?: string;
  placeholder?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

// Intelligent balance formatting
const formatBalance = (balance: string, tokenSymbol?: string): string => {
  const num = parseFloat(balance);
  if (isNaN(num)) return balance;

  // For stablecoins and tokens with large balances
  const isStablecoin = ['USDC', 'USDT', 'DAI', 'BUSD'].includes(tokenSymbol || '');
  
  if (isStablecoin || num >= 1000) {
    // For large numbers, show comma formatting with 2 decimals
    if (num >= 1000) {
      return num.toLocaleString('en-US', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 
      });
    }
    // For stablecoins under 1000, show 2 decimals
    return num.toFixed(2);
  }
  
  // For ETH-like tokens with small balances
  if (num < 0.01) {
    // Show up to 6 significant digits for very small numbers
    return num.toPrecision(4);
  } else if (num < 1) {
    // Show up to 4 decimals for small numbers
    return parseFloat(num.toFixed(4)).toString();
  } else if (num < 100) {
    // Show up to 3 decimals for medium numbers
    return parseFloat(num.toFixed(3)).toString();
  }
  
  // Default: 2 decimals
  return num.toFixed(2);
};

export const PaymentInput: React.FC<PaymentInputProps> = ({
  amount,
  onAmountChange,
  selectedToken,
  onTokenSelect,
  balance,
  error,
  placeholder = "0.00",
  label,
  helperText,
  disabled = false,
  required = false,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(value);
    }
  };

  const handleMaxClick = () => {
    if (balance && !disabled) {
      onAmountChange(balance);
      inputRef.current?.focus();
    }
  };

  const formattedBalance = balance ? formatBalance(balance, selectedToken?.symbol) : null;

  return (
    <div className={`w-full ${className}`}>
      {/* Label - if provided separately */}
      {label && (
        <label className="block text-sm text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Main Input Container - No wrapper, single border */}
      <div className="space-y-1.5">
        <div 
          className={`
            relative flex items-center rounded-lg border bg-white
            transition-all duration-200
            ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}
            ${error 
              ? 'border-red-300 focus-within:border-red-400' 
              : isFocused 
                ? 'border-gray-300' 
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
          style={{ height: '40px' }} // Fixed height matching normal inputs
        >
          {/* Amount Input */}
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className="
              flex-1 px-3 h-full
              bg-transparent rounded-l-lg
              text-sm text-gray-900 placeholder-gray-400
              focus:outline-none
              disabled:cursor-not-allowed
            "
            style={{ paddingRight: balance ? '3.5rem' : '0.75rem' }} // Space for MAX button
          />

          {/* MAX button - Inside input, on the right */}
          {balance && !disabled && (
            <button
              type="button"
              onClick={handleMaxClick}
              className="
                absolute right-[140px] // Position before token selector
                px-2 py-0.5
                text-[10px] font-semibold text-gray-500
                hover:text-gray-700 hover:bg-gray-50
                rounded transition-colors duration-150
                uppercase tracking-wide
              "
            >
              MAX
            </button>
          )}

          {/* Divider */}
          <div className="h-5 w-px bg-gray-200 mr-1" />

          {/* Token Selector - Compact version */}
          <div className={`
            h-full flex items-center pr-1
            ${disabled ? 'pointer-events-none opacity-60' : ''}
          `}>
            <TokenSelector
              selectedToken={selectedToken}
              onClick={onTokenSelect}
              persistSelection={true}
              compact={true}
            />
          </div>
        </div>

        {/* Balance Display */}
        {balance && selectedToken && !error && (
          <div className="text-xs text-gray-500 px-1">
            Balance: <span className="font-medium text-gray-700">
              {formattedBalance} {selectedToken.symbol}
            </span>
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

export default PaymentInput;
