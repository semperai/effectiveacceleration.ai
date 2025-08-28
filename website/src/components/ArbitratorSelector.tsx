'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { zeroAddress } from 'viem';
import ProfileImage from '@/components/ProfileImage';
import type { Arbitrator } from '@effectiveacceleration/contracts';

// Type assertion helper to ensure Arbitrator has all required fields for ProfileImage
type ArbitratorWithProfile = Arbitrator & {
  address_: string;
  publicKey: string;
  name: string;
  bio: string;
  avatar: string;
  fee: number;
  settledCount: number;
  refusedCount: number;
};

interface ArbitratorSelectorProps {
  arbitrators: Arbitrator[];
  selectedAddress: string;
  onChange: (address: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showExternalLink?: boolean;
  showNoArbitrator?: boolean;
}

export const ArbitratorSelector: React.FC<ArbitratorSelectorProps> = ({
  arbitrators,
  selectedAddress,
  onChange,
  disabled = false,
  placeholder = 'Select an arbitrator',
  className = '',
  showExternalLink = true,
  showNoArbitrator = true,
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedArbitrator = arbitrators?.find(
    (a) => a.address_ === selectedAddress
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  // Update position on scroll or resize
  useEffect(() => {
    if (!open || !buttonRef.current || !dropdownRef.current) return;

    const updatePosition = () => {
      if (!buttonRef.current || !dropdownRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;

      // Calculate available space
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = Math.min(300, dropdown.scrollHeight);

      // Position dropdown
      if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
        // Show below
        dropdown.style.top = `${rect.bottom + 8}px`;
        dropdown.style.bottom = 'auto';
        dropdown.style.maxHeight = `${Math.min(300, spaceBelow - 20)}px`;
      } else {
        // Show above
        dropdown.style.bottom = `${window.innerHeight - rect.top + 8}px`;
        dropdown.style.top = 'auto';
        dropdown.style.maxHeight = `${Math.min(300, spaceAbove - 20)}px`;
      }

      dropdown.style.left = `${rect.left}px`;
      dropdown.style.width = `${rect.width}px`;
    };

    // Initial position
    updatePosition();

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  const renderDropdownContent = () => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0 }}
        onClick={() => setOpen(false)}
      />

      {/* Dropdown Menu - Updated to match PaymentInput styling */}
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          zIndex: 51,
          overflow: 'hidden',
          borderRadius: '0.5rem',
          backgroundColor: 'white',
          boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgb(229 231 235)',
        }}
        className='dark:border-gray-700 dark:bg-gray-800'
      >
        <div
          style={{
            overflowY: 'auto',
            maxHeight: 'inherit',
            padding: '0.25rem 0',
          }}
        >
          {/* No Arbitrator option */}
          {showNoArbitrator && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
                className='hover:bg-gray-50 dark:hover:bg-gray-700'
                onClick={() => {
                  onChange(zeroAddress);
                  setOpen(false);
                }}
              >
                <div
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    flexShrink: 0,
                  }}
                  className='bg-gray-200 dark:bg-gray-700'
                />
                <span
                  style={{ fontSize: '0.875rem' }}
                  className='text-gray-700 dark:text-gray-300'
                >
                  No Arbitrator
                </span>
              </div>

              {/* Divider */}
              {arbitrators && arbitrators.length > 0 && (
                <div
                  style={{
                    height: '1px',
                    margin: '0.25rem 0',
                  }}
                  className='bg-gray-200 dark:bg-gray-700'
                />
              )}
            </>
          )}

          {/* Arbitrator list */}
          {arbitrators?.map((arbitrator) => (
            <div
              key={arbitrator.address_}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              className='hover:bg-gray-50 dark:hover:bg-gray-700'
              onClick={() => {
                onChange(arbitrator.address_);
                setOpen(false);
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <ProfileImage
                  user={arbitrator as ArbitratorWithProfile}
                  className='h-8 w-8 flex-shrink-0 rounded-full'
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    className='text-gray-900 dark:text-gray-100'
                  >
                    {arbitrator.name}
                  </p>
                  <p
                    style={{ fontSize: '0.75rem' }}
                    className='text-gray-500 dark:text-gray-400'
                  >
                    {arbitrator.fee / 100}% fee
                    {arbitrator.settledCount !== undefined &&
                      ` • ${arbitrator.settledCount} cases`}
                  </p>
                </div>
              </div>
              {showExternalLink && (
                <a
                  href={`/arbitrators/${arbitrator.address_}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.375rem',
                    borderRadius: '0.25rem',
                    flexShrink: 0,
                    transition: 'background-color 0.15s',
                  }}
                  className='hover:bg-gray-200 dark:hover:bg-gray-600'
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type='button'
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 transition-all duration-200 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${open ? 'border-gray-300' : 'border-gray-200 hover:border-gray-300'} ${className} `}
        style={{ height: '40px' }}
      >
        <div className='flex flex-1 items-center gap-3'>
          {selectedAddress === zeroAddress && showNoArbitrator ? (
            <div className='flex items-center gap-2'>
              <div className='h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700' />
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                No Arbitrator
              </span>
            </div>
          ) : selectedArbitrator ? (
            <>
              <ProfileImage
                user={selectedArbitrator as ArbitratorWithProfile}
                className='h-8 w-8 rounded-full'
              />
              <div className='text-left'>
                <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {selectedArbitrator.name}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {selectedArbitrator.fee / 100}% fee
                </p>
              </div>
            </>
          ) : (
            <span className='text-sm text-gray-400'>{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''} `}
        />

        {showExternalLink &&
          selectedArbitrator &&
          selectedAddress !== zeroAddress && (
            <a
              href={`/arbitrators/${selectedAddress}`}
              target='_blank'
              rel='noopener noreferrer'
              className='ml-2 rounded p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className='h-4 w-4 text-gray-500 dark:text-gray-400' />
            </a>
          )}
      </button>

      {/* Portal for dropdown */}
      {open &&
        !disabled &&
        typeof document !== 'undefined' &&
        ReactDOM.createPortal(renderDropdownContent(), document.body)}
    </>
  );
};

export default ArbitratorSelector;
