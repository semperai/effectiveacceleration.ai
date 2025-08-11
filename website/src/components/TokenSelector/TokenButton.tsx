import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Token } from '@/lib/tokens';
import { IArbitrumToken } from './helpers';
import { DEFAULT_TOKEN_ICON } from './icons/DefaultTokenIcon';

export default function TokenButton({
  onClick,
  selectedToken,
  compact = false, // New prop for compact mode
}: {
  onClick: () => void;
  selectedToken: Token | IArbitrumToken | undefined;
  compact?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Compact mode styles
  const buttonStyle = compact
    ? {
        display: 'inline-flex',
        alignItems: 'center',
        width: '100%',
        height: '100%', // Full height of parent
        padding: '0 12px',
        background: isHovered ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
        borderWidth: '0',
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderRadius: '0 0.5rem 0.5rem 0', // Rounded right side only
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        outline: 'none',
        position: 'relative' as const,
        overflow: 'hidden',
        color: selectedToken ? '#111827' : '#6b7280',
      }
    : {
        // Original styles for non-compact mode
        display: 'inline-flex',
        alignItems: 'center',
        width: '100%',
        height: '56px',
        padding: '0 16px',
        background: isHovered ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
        borderWidth: isFocused ? '2px' : '0',
        borderStyle: 'solid',
        borderColor: isFocused ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
        borderRadius: '0.75rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        outline: 'none',
        position: 'relative' as const,
        overflow: 'hidden',
        transform: isHovered ? 'scale(1.01)' : 'scale(1)',
        color: selectedToken ? '#111827' : '#6b7280',
      };

  const contentStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: compact ? '8px' : '12px',
    width: '100%',
  };

  const avatarContainerStyle = {
    position: 'relative' as const,
    width: compact ? '18px' : '24px',
    height: compact ? '18px' : '24px',
    minWidth: compact ? '18px' : '24px',
    minHeight: compact ? '18px' : '24px',
    flexShrink: 0,
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'rgba(0, 0, 0, 0.02)',
    boxShadow: compact ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)',
  };

  const symbolStyle = {
    fontSize: compact ? '0.813rem' : '0.875rem',
    fontWeight: 600,
    flex: 1,
    textAlign: 'left' as const,
    letterSpacing: '-0.01em',
  };

  const textStyle = {
    fontSize: compact ? '0.813rem' : '0.875rem',
    fontWeight: 500,
    flex: 1,
    textAlign: 'left' as const,
    color: '#6b7280',
  };

  const chevronStyle = {
    width: compact ? '14px' : '16px',
    height: compact ? '14px' : '16px',
    minWidth: compact ? '14px' : '16px',
    color: isHovered ? '#6b7280' : '#9ca3af',
    transition: 'all 0.15s ease',
    marginLeft: 'auto',
    transform: isHovered ? 'translateY(1px)' : 'translateY(0)',
  };

  const placeholderIconStyle = {
    width: compact ? '18px' : '24px',
    height: compact ? '18px' : '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    flexShrink: 0,
  };

  if (selectedToken) {
    // Type guard to safely access the icon/logoURI property
    let icon: string | undefined;
    if ('logoURI' in selectedToken) {
      icon = selectedToken.logoURI;
    } else {
      icon = (selectedToken as Token).icon;
    }

    const symbol = selectedToken.symbol;
    const displayIcon = imageError
      ? DEFAULT_TOKEN_ICON
      : icon || DEFAULT_TOKEN_ICON;

    return (
      <button
        type='button'
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={buttonStyle}
      >
        <div style={contentStyle}>
          <div style={avatarContainerStyle}>
            <Image
              src={displayIcon}
              alt={symbol}
              width={compact ? 18 : 24}
              height={compact ? 18 : 24}
              style={{
                objectFit: 'cover',
              }}
              onError={() => {
                setImageError(true);
              }}
              unoptimized={
                displayIcon.startsWith('data:') ||
                displayIcon.startsWith('blob:')
              }
            />
          </div>
          <span style={symbolStyle}>{symbol}</span>
          <ChevronDown style={chevronStyle} />
        </div>
      </button>
    );
  } else {
    return (
      <button
        type='button'
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={buttonStyle}
      >
        <div style={contentStyle}>
          <div style={placeholderIconStyle}>
            <svg
              width={compact ? '16' : '20'}
              height={compact ? '16' : '20'}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='12' cy='12' r='10' />
              <path d='M12 6v6l4 2' />
            </svg>
          </div>
          <span style={textStyle}>Select</span>
          <ChevronDown style={chevronStyle} />
        </div>
      </button>
    );
  }
}
