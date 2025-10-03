import '@testing-library/jest-dom';

// Mock wagmi at the top level to avoid ESM issues
jest.mock('wagmi', () => {
  const mockConfig = {
    chains: [],
    transports: {},
  };

  return {
    WagmiProvider: ({ children }: any) => children,
    createConfig: jest.fn(() => mockConfig),
    http: jest.fn(),
    useAccount: jest.fn(() => ({ address: undefined, isConnected: false })),
    useBalance: jest.fn(() => ({ data: undefined })),
    useReadContract: jest.fn(() => ({ data: undefined })),
    useWriteContract: jest.fn(() => ({ writeContract: jest.fn() })),
    useWaitForTransactionReceipt: jest.fn(() => ({ data: undefined })),
    useChainId: jest.fn(() => 1),
    useSwitchChain: jest.fn(() => ({ switchChain: jest.fn() })),
    useWalletClient: jest.fn(() => ({ data: undefined })),
    useConfig: jest.fn(() => mockConfig),
  };
});

// Mock @rainbow-me/rainbowkit
jest.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({ children }: any) => children,
  getDefaultConfig: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
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
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
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
