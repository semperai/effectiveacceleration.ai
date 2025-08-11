// src/components/PaymentInput/index.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { TokenSelector } from '@/components/TokenSelector';
import { type Token } from '@/tokens';
import { useAccount, useBalance } from 'wagmi';

interface PaymentInputProps {
  amount: string;
  onAmountChange: (value: string) => void;
  selectedToken?: Token;
  onTokenSelect: (token: Token) => void;
  onBalanceUpdate?: (balance: string | undefined) => void;
  error?: string;
  placeholder?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  validateAmount?: boolean;
}

// Intelligent balance formatting
const formatBalance = (balance: string, tokenSymbol?: string): string => {
  const num = parseFloat(balance);
  if (isNaN(num)) return balance;

  // For stablecoins and tokens with large balances
  const isStablecoin = ['USDC', 'USDT', 'DAI', 'BUSD'].includes(
    tokenSymbol || ''
  );

  if (isStablecoin || num >= 1000) {
    // For large numbers, show comma formatting with 2 decimals
    if (num >= 1000) {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
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
  onBalanceUpdate,
  error,
  placeholder = '0.00',
  label,
  helperText,
  disabled = false,
  required = false,
  className = '',
  validateAmount = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | undefined>(
    undefined
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const { address } = useAccount();

  // Fetch balance for selected token using wagmi's useBalance hook
  const { data: balanceData } = useBalance({
    address: address,
    token: selectedToken?.id as `0x${string}` | undefined,
    query: {
      enabled: !!address && !!selectedToken,
    },
  });

  // Update token balance when balance data changes
  useEffect(() => {
    if (balanceData) {
      const formattedBalance = balanceData.formatted;
      setTokenBalance(formattedBalance);

      // Also notify parent component if callback provided
      if (onBalanceUpdate) {
        onBalanceUpdate(formattedBalance);
      }
    } else {
      setTokenBalance(undefined);
      if (onBalanceUpdate) {
        onBalanceUpdate(undefined);
      }
    }
  }, [balanceData, onBalanceUpdate]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(value);
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    }
  };

  const handleMaxClick = () => {
    if (tokenBalance && !disabled) {
      onAmountChange(tokenBalance);
      inputRef.current?.focus();
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    }
  };

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    // Reset interaction state when token changes
    setHasInteracted(false);
  };

  // Also accept balance updates from TokenSelector if it provides them
  const handleBalanceChange = (balance: string | undefined) => {
    // Only update if we don't already have balance data from useBalance
    if (!balanceData && balance) {
      setTokenBalance(balance);
      // Also notify parent component if callback provided
      if (onBalanceUpdate) {
        onBalanceUpdate(balance);
      }
    }
  };

  const formattedBalance = tokenBalance
    ? formatBalance(tokenBalance, selectedToken?.symbol)
    : null;

  // Validate amount against balance
  const isAmountValid = () => {
    if (!validateAmount || !amount || amount === '0' || amount === '')
      return true;
    if (!tokenBalance) return true;

    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(tokenBalance);

    if (isNaN(amountNum) || isNaN(balanceNum)) return true;

    return amountNum <= balanceNum;
  };

  const isInsufficientBalance = !isAmountValid();

  // Show validation error only after user has interacted
  const showValidationError =
    hasInteracted && isInsufficientBalance && amount !== '';
  const displayError =
    error || (showValidationError ? 'Insufficient balance' : '');

  return (
    <div className={`w-full ${className}`}>
      {/* Label - if provided separately */}
      {label && (
        <label className='mb-2 block text-sm text-gray-700'>
          {label}
          {required && <span className='ml-1 text-red-500'>*</span>}
        </label>
      )}

      {/* Main Input Container - No wrapper, single border */}
      <div className='space-y-1.5'>
        <div
          className={`relative flex items-center rounded-lg border bg-white transition-all duration-200 ${disabled ? 'cursor-not-allowed bg-gray-50 opacity-60' : ''} ${
            displayError
              ? 'border-red-300 focus-within:border-red-400'
              : isFocused
                ? 'border-gray-300'
                : 'border-gray-200 hover:border-gray-300'
          } `}
          style={{ height: '40px' }} // Fixed height matching normal inputs
        >
          {/* Amount Input Container with MAX button */}
          <div className='relative flex flex-1 items-center'>
            <input
              ref={inputRef}
              type='text'
              inputMode='decimal'
              value={amount}
              onChange={handleAmountChange}
              placeholder={placeholder}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              className={`h-full flex-1 rounded-l-lg border-0 bg-transparent px-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:outline-none focus:ring-0 disabled:cursor-not-allowed ${tokenBalance ? 'pr-12' : 'pr-3'} `}
              style={{
                boxShadow: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
              }}
            />

            {/* MAX button - Positioned relative to input container */}
            {tokenBalance && !disabled && (
              <button
                type='button'
                onClick={handleMaxClick}
                className='absolute right-2 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-700'
              >
                MAX
              </button>
            )}
          </div>

          {/* Divider - Softer gray */}
          <div className='mr-1 h-5 w-px bg-gray-200' />

          {/* Token Selector - Compact version with balance callback */}
          <div
            className={`flex h-full items-center pr-1 ${disabled ? 'pointer-events-none opacity-60' : ''} `}
          >
            <TokenSelector
              selectedToken={selectedToken}
              onClick={handleTokenSelect}
              onBalanceChange={handleBalanceChange}
              persistSelection={true}
              compact={true}
            />
          </div>
        </div>

        {/* Balance Display - Always show if available */}
        {tokenBalance && selectedToken && (
          <div className='px-1 text-xs text-gray-500'>
            Balance:{' '}
            <span
              className={`font-medium ${isInsufficientBalance && hasInteracted ? 'text-red-600' : 'text-gray-700'}`}
            >
              {formattedBalance} {selectedToken.symbol}
            </span>
          </div>
        )}

        {/* Error - Only show external errors or validation errors after interaction */}
        {displayError && (
          <div className='flex items-center gap-1 px-1 text-xs text-red-600'>
            <AlertCircle className='h-3 w-3' />
            <span>{displayError}</span>
          </div>
        )}

        {/* Helper text */}
        {!displayError && helperText && (
          <p className='px-1 text-xs text-gray-500'>{helperText}</p>
        )}
      </div>
    </div>
  );
};

export default PaymentInput;
