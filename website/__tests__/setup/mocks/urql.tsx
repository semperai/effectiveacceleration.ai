import { vi } from 'vitest';
import { fromValue, pipe, map } from 'wonka';
import { Client, Provider } from 'urql';
import React, { ReactNode } from 'react';

export interface MockedQuery {
  query: any;
  variables?: Record<string, any>;
  data: any;
  error?: Error;
}

export function createMockUrqlClient(mocks: MockedQuery[]) {
  const executeQuery = vi.fn((request: any) => {
    const mock = mocks.find(
      (m) => {
        // Compare query by converting to string (handles DocumentNode comparison)
        const queryMatch = String(m.query) === String(request.query) || m.query === request.query;
        const variablesMatch = JSON.stringify(m.variables || {}) === JSON.stringify(request.variables || {});
        return queryMatch && variablesMatch;
      }
    );

    if (mock) {
      if (mock.error) {
        return fromValue({
          operation: request,
          data: undefined,
          error: mock.error,
          stale: false,
          hasNext: false,
        });
      }

      return fromValue({
        operation: request,
        data: mock.data,
        error: undefined,
        stale: false,
        hasNext: false,
      });
    }

    // Return empty data if no mock found
    return fromValue({
      operation: request,
      data: undefined,
      error: new Error(`No mock found for query: ${request.query}`),
      stale: false,
      hasNext: false,
    });
  });

  return {
    executeQuery,
    executeMutation: vi.fn(),
    executeSubscription: vi.fn(),
  } as unknown as Client;
}

export function createUrqlWrapper(mocks: MockedQuery[]) {
  const client = createMockUrqlClient(mocks);

  return ({ children }: { children: ReactNode }) => (
    <Provider value={client}>{children}</Provider>
  );
}

// Mock data exports
export const mockJob = {
  id: '1',
  address: '0x123',
  chainId: '1',
  title: 'Test Job',
  content: 'Test job description',
  tags: ['digital-audio', 'video'],
  token: '0xUSDC',
  amount: '1000000000',
  maxTime: '86400',
  deliveryMethod: 'ipfs',
  roles: {
    creator: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    worker: null,
    arbitrator: '0xArbitrator',
  },
  state: 'Open',
  createdAt: '1234567890',
  timestamp: '1234567890',
  events: [],
};

export const mockUser = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  name: 'Test User',
  bio: 'Test bio',
  avatar: 'https://example.com/avatar.png',
  publicKey: '0xPublicKey',
  timestamp: '1234567890',
};

export const mockArbitrator = {
  address: '0xArbitrator',
  name: 'Test Arbitrator',
  bio: 'Test arbitrator bio',
  fee: '100',
  settledCount: '10',
  refusedCount: '2',
};
