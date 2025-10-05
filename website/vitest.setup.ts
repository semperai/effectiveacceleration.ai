import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock wagmi at the top level to avoid ESM issues
vi.mock('wagmi', () => {
  const mockConfig = {
    chains: [],
    transports: {},
  };

  return {
    WagmiProvider: ({ children }: any) => children,
    createConfig: vi.fn(() => mockConfig),
    http: vi.fn(),
    useAccount: vi.fn(() => ({ address: undefined, isConnected: false })),
    useBalance: vi.fn(() => ({ data: undefined })),
    useReadContract: vi.fn(() => ({ data: undefined })),
    useWriteContract: vi.fn(() => ({ writeContract: vi.fn() })),
    useWaitForTransactionReceipt: vi.fn(() => ({ data: undefined })),
    useChainId: vi.fn(() => 1),
    useSwitchChain: vi.fn(() => ({ switchChain: vi.fn() })),
    useWalletClient: vi.fn(() => ({ data: undefined })),
    useConfig: vi.fn(() => mockConfig),
  };
});

// Mock @rainbow-me/rainbowkit
vi.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({ children }: any) => children,
  getDefaultConfig: vi.fn(),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Add TextEncoder/TextDecoder for vitest
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
