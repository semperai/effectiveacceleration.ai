import { renderHook, waitFor } from '@testing-library/react';
import { Provider as UrqlProvider, Client } from 'urql';
import { fromValue } from 'wonka';
import useJobs from '../../../src/hooks/subsquid/useJobs';
import { GET_JOBS } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

const mockJob = {
  id: '1',
  state: 0,
  whitelistWorkers: false,
  roles: {
    creator: '0xCreator',
    worker: null,
    arbitrator: '0xArbitrator',
  },
  jobTimes: {
    arbitratedAt: null,
    closedAt: null,
    assignedAt: null,
    disputedAt: null,
    createdAt: '1234567890',
    lastEventAt: '1234567890',
    openedAt: '1234567890',
    updatedAt: '1234567890',
  },
  title: 'Test Job 1',
  tags: ['digital-audio'],
  contentHash: 'QmTest123',
  content: 'Test Description',
  multipleApplicants: false,
  amount: '1000000',
  token: '0xUSDC',
  timestamp: '1234567890',
  maxTime: '86400',
  deliveryMethod: 'ipfs',
  collateralOwed: '0',
  escrowId: '1',
  resultHash: null,
  rating: null,
  disputed: false,
  allowedWorkers: [],
};

const mockJobs = [
  mockJob,
  {
    ...mockJob,
    id: '2',
    title: 'Test Job 2',
    state: 1,
  },
];

const createMockClient = (data: any) => {
  return {
    executeQuery: () => fromValue({ data }),
    executeMutation: () => fromValue({}),
    executeSubscription: () => fromValue({}),
  } as unknown as Client;
};

const wrapper = (data: any) => ({ children }: { children: ReactNode }) => (
  <UrqlProvider value={createMockClient(data)}>
    {children}
  </UrqlProvider>
);

describe('useJobs', () => {
  it('should fetch all jobs with default limit', async () => {
    const { result } = renderHook(
      () => useJobs({ offset: 0, limit: 0 }),
      { wrapper: wrapper({ jobs: mockJobs }) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
  });

  it('should fetch jobs with specific limit', async () => {
    const { result } = renderHook(
      () => useJobs({ offset: 0, limit: 5 }),
      { wrapper: wrapper({ jobs: mockJobs.slice(0, 1) }) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
  });

  it('should support fake mode', () => {
    const { result } = renderHook(
      () => useJobs({ fake: true }),
      { wrapper: wrapper({}) }
    );

    // Fake mode returns data immediately without loading
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.loading).toBe(false);
  });
});
