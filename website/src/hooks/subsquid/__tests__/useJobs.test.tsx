import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useJobs from '../useJobs';
import { GET_JOBS } from '../queries';
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

const mocks = [
  {
    request: {
      query: GET_JOBS(),
      variables: {
        offset: 0,
        limit: 1000,
      },
    },
    result: {
      data: {
        jobs: mockJobs,
      },
    },
  },
  {
    request: {
      query: GET_JOBS(),
      variables: {
        offset: 0,
        limit: 5,
      },
    },
    result: {
      data: {
        jobs: mockJobs.slice(0, 1),
      },
    },
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe('useJobs', () => {
  it('should fetch all jobs with default limit', async () => {
    const { result } = renderHook(
      () => useJobs({ offset: 0, limit: 0 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
  });

  it('should fetch jobs with specific limit', async () => {
    const { result } = renderHook(
      () => useJobs({ offset: 0, limit: 5 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useJobs({ offset: 0, limit: 0 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should support fake mode', () => {
    const { result } = renderHook(
      () => useJobs({ fake: true }),
      { wrapper }
    );

    // Fake mode returns data immediately without loading
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
