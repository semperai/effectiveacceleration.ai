// components/TokenSelector/styles.ts
import { CSSProperties } from 'react';

// Style constants
const colors = {
  white: '#ffffff',
  gray: {
    50: 'rgba(255, 255, 255, 0.05)',
    100: 'rgba(255, 255, 255, 0.1)',
    200: 'rgba(255, 255, 255, 0.2)',
    300: 'rgba(255, 255, 255, 0.3)',
    400: 'rgba(255, 255, 255, 0.4)',
    500: 'rgba(255, 255, 255, 0.5)',
    600: 'rgba(255, 255, 255, 0.6)',
    700: 'rgba(255, 255, 255, 0.7)',
    800: 'rgba(255, 255, 255, 0.8)',
    900: 'rgba(255, 255, 255, 0.9)',
  },
  blue: {
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    light: '#93c5fd',
  },
  purple: {
    400: '#c084fc',
    500: '#9333ea',
    600: '#7c3aed',
  },
  rose: {
    500: '#f87171',
  },
  yellow: {
    400: '#fbbf24',
  },
  dark: {
    900: 'rgba(17, 24, 39, 0.95)',
    black: 'rgba(0, 0, 0, 0.95)',
  },
};

const transitions = {
  default: 'all 0.2s ease',
  medium: 'all 0.3s ease',
  slow: 'all 0.5s ease',
};

// Main styles object
export const styles = {
  // Overlay
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(12px)',
    animation: 'fadeIn 0.2s ease-out',
  } as CSSProperties,

  // Container
  container: {
    position: 'relative' as const,
    width: '480px',
    maxWidth: 'calc(100vw - 2rem)',
    maxHeight: 'calc(100vh - 4rem)',
    background: `linear-gradient(to bottom, ${colors.dark[900]}, ${colors.dark.black})`,
    backdropFilter: 'blur(24px)',
    borderRadius: '1rem',
    border: `1px solid ${colors.gray[100]}`,
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease-out',
    display: 'flex',
    flexDirection: 'column' as const,
  } as CSSProperties,

  // Gradient Orbs
  gradientOrb: {
    position: 'absolute' as const,
    borderRadius: '50%',
    filter: 'blur(60px)',
    pointerEvents: 'none' as const,
    zIndex: 0,
  } as CSSProperties,

  gradientOrb1: {
    top: '-50px',
    right: '-50px',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
  } as CSSProperties,

  gradientOrb2: {
    bottom: '-50px',
    left: '-50px',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
  } as CSSProperties,

  // Header
  header: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    borderBottom: `1px solid ${colors.gray[100]}`,
  } as CSSProperties,

  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.white,
    margin: 0,
  } as CSSProperties,

  headerIcon: {
    width: '20px',
    height: '20px',
    color: colors.yellow[400],
    animation: 'sparkle 2s ease-in-out infinite',
  } as CSSProperties,

  closeButton: {
    padding: '0.5rem',
    background: 'transparent',
    border: 'none',
    color: colors.gray[600],
    cursor: 'pointer',
    borderRadius: '0.5rem',
    transition: transitions.default,
  } as CSSProperties,

  closeButtonHover: {
    background: colors.gray[100],
    color: colors.white,
    transform: 'rotate(90deg)',
  } as CSSProperties,

  // Favorite Tokens Container
  favoriteTokensContainer: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    borderBottom: `1px solid ${colors.gray[100]}`,
  } as CSSProperties,

  favoriteTokenChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0.75rem',
    background: colors.gray[50],
    border: `1px solid transparent`,
    borderRadius: '9999px',
    color: colors.white,
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: transitions.default,
    position: 'relative' as const,
  } as CSSProperties,

  favoriteTokenChipHover: {
    background: colors.gray[100],
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  } as CSSProperties,

  favoriteTokenChipSelected: {
    background: `rgba(59, 130, 246, 0.2)`,
    border: `1px solid rgba(59, 130, 246, 0.5)`,
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
  } as CSSProperties,

  favoriteTokenAvatar: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
  } as CSSProperties,

  removeFavorite: {
    marginLeft: '0.25rem',
    padding: '0.125rem',
    background: 'transparent',
    border: 'none',
    color: colors.gray[500],
    cursor: 'pointer',
    borderRadius: '50%',
    transition: transitions.default,
  } as CSSProperties,

  removeFavoriteHover: {
    background: colors.gray[100],
    color: colors.white,
  } as CSSProperties,

  // Search Container
  searchContainer: {
    position: 'relative' as const,
    zIndex: 1,
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  } as CSSProperties,

  searchIcon: {
    position: 'absolute' as const,
    left: '2.25rem',
    width: '18px',
    height: '18px',
    color: colors.gray[500],
    pointerEvents: 'none' as const,
  } as CSSProperties,

  searchInput: {
    flex: 1,
    padding: '0.625rem 1rem 0.625rem 2.5rem',
    background: colors.gray[50],
    border: `1px solid ${colors.gray[100]}`,
    borderRadius: '0.75rem',
    color: colors.white,
    fontSize: '0.875rem',
    transition: transitions.default,
    outline: 'none',
  } as CSSProperties,

  searchInputHover: {
    background: 'rgba(255, 255, 255, 0.08)',
    borderColor: colors.gray[200],
  } as CSSProperties,

  searchInputFocus: {
    background: colors.gray[100],
    borderColor: 'rgba(59, 130, 246, 0.5)',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  } as CSSProperties,

  clearButton: {
    position: 'absolute' as const,
    right: '2rem',
    padding: '0.375rem',
    background: 'transparent',
    border: 'none',
    color: colors.gray[500],
    cursor: 'pointer',
    borderRadius: '0.375rem',
    transition: transitions.default,
  } as CSSProperties,

  clearButtonHover: {
    background: colors.gray[100],
    color: colors.white,
  } as CSSProperties,

  // Token List Container
  tokenListContainer: {
    position: 'relative' as const,
    zIndex: 1,
    flex: 1,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    maxHeight: '400px',
    scrollbarWidth: 'thin' as any,
    scrollbarColor: `${colors.gray[200]} transparent`,
  } as CSSProperties,

  tokenListScrollbar: `
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: ${colors.gray[200]};
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: ${colors.gray[300]};
    }
  `,

  scrollGradientTop: {
    content: '""',
    position: 'sticky' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '20px',
    background: `linear-gradient(to bottom, ${colors.dark[900]}, transparent)`,
    pointerEvents: 'none' as const,
    zIndex: 10,
  } as CSSProperties,

  scrollGradientBottom: {
    content: '""',
    position: 'sticky' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '20px',
    background: `linear-gradient(to top, ${colors.dark.black}, transparent)`,
    pointerEvents: 'none' as const,
    zIndex: 10,
  } as CSSProperties,

  // No Tokens Found
  noTokensFound: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: colors.gray[500],
    fontStyle: 'italic' as const,
  } as CSSProperties,

  // Token List
  tokenList: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as CSSProperties,

  // Token Item
  tokenItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    padding: '0.875rem 1.5rem',
    borderBottom: `1px solid ${colors.gray[50]}`,
    cursor: 'pointer',
    transition: transitions.default,
    position: 'relative' as const,
    overflow: 'hidden',
  } as CSSProperties,

  tokenItemHover: {
    background: colors.gray[50],
  } as CSSProperties,

  tokenItemSelected: {
    background: `linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))`,
    borderLeft: `3px solid ${colors.blue[500]}`,
  } as CSSProperties,

  tokenItemShimmer: {
    content: '""',
    position: 'absolute' as const,
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent)',
    transition: 'left 0.5s ease',
  } as CSSProperties,

  // Token Avatar
  tokenAvatarContainer: {
    position: 'relative' as const,
    width: '36px',
    height: '36px',
    flexShrink: 0,
  } as CSSProperties,

  tokenAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: colors.gray[100],
    border: `1px solid ${colors.gray[200]}`,
    objectFit: 'cover' as const,
  } as CSSProperties,

  tokenAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: `linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))`,
    border: `1px solid ${colors.gray[200]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.white,
  } as CSSProperties,

  // Token Info
  tokenInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    minWidth: 0,
  } as CSSProperties,

  tokenNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as CSSProperties,

  tokenName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.white,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } as CSSProperties,

  customBadge: {
    padding: '0.125rem 0.375rem',
    background: `linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(168, 85, 247, 0.2))`,
    border: `1px solid rgba(147, 51, 234, 0.3)`,
    borderRadius: '0.25rem',
    fontSize: '0.625rem',
    color: colors.purple[400],
    fontWeight: 500,
  } as CSSProperties,

  tokenMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as CSSProperties,

  tokenSymbol: {
    fontSize: '0.75rem',
    color: colors.gray[500],
  } as CSSProperties,

  tokenBalance: {
    fontSize: '0.75rem',
    color: colors.gray[400],
  } as CSSProperties,

  // Token Actions
  tokenActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as CSSProperties,

  actionButton: {
    padding: '0.375rem',
    background: 'transparent',
    border: 'none',
    color: colors.gray[400],
    cursor: 'pointer',
    borderRadius: '0.375rem',
    transition: transitions.default,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,

  actionButtonSmall: {
    padding: '0.25rem',
    background: 'transparent',
    border: 'none',
    color: colors.gray[300],
    cursor: 'pointer',
    borderRadius: '0.25rem',
    transition: transitions.default,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  } as CSSProperties,

  actionButtonHover: {
    background: colors.gray[100],
    color: colors.white,
    transform: 'scale(1.1)',
    opacity: 1,
  } as CSSProperties,

  // Add Token Container
  addTokenContainer: {
    position: 'relative' as const,
    zIndex: 1,
    padding: '1rem 1.5rem',
    background: 'rgba(0, 0, 0, 0.3)',
    borderTop: `1px solid ${colors.gray[100]}`,
  } as CSSProperties,

  addTokenButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    background: 'rgba(59, 130, 246, 0.1)',
    border: `1px solid rgba(59, 130, 246, 0.3)`,
    borderRadius: '0.75rem',
    color: colors.blue[400],
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: transitions.default,
  } as CSSProperties,

  addTokenButtonHover: {
    background: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    color: colors.blue.light,
  } as CSSProperties,

  addTokenForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  } as CSSProperties,

  tokenAddressInput: {
    padding: '0.625rem 1rem',
    background: colors.gray[50],
    border: `1px solid ${colors.gray[100]}`,
    borderRadius: '0.75rem',
    color: colors.white,
    fontSize: '0.875rem',
    outline: 'none',
    transition: transitions.default,
  } as CSSProperties,

  tokenAddressInputFocus: {
    background: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  } as CSSProperties,

  tokenAddressInputError: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  } as CSSProperties,

  errorMessage: {
    color: colors.rose[500],
    fontSize: '0.75rem',
    margin: '-0.5rem 0 0 0',
  } as CSSProperties,

  confirmAddButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    background: `linear-gradient(135deg, ${colors.blue[500]}, ${colors.purple[500]})`,
    border: 'none',
    borderRadius: '0.75rem',
    color: colors.white,
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: transitions.default,
  } as CSSProperties,

  confirmAddButtonHover: {
    background: `linear-gradient(135deg, ${colors.blue[600]}, ${colors.purple[600]})`,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  } as CSSProperties,

  confirmAddButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    background: colors.gray[100],
  } as CSSProperties,
};

// Animation keyframes as a string to be injected
export const keyframes = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes sparkle {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
`;

// Helper function to merge styles
export const mergeStyles = (...styles: (CSSProperties | undefined)[]) => {
  return Object.assign({}, ...styles.filter(Boolean));
};

// Mobile styles
export const mobileStyles = {
  container: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: '100vh',
    borderRadius: 0,
  } as CSSProperties,

  tokenListContainer: {
    maxHeight: 'calc(100vh - 280px)',
  } as CSSProperties,
};
