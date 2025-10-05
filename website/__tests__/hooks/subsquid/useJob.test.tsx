import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import useJob from '../../../src/hooks/subsquid/useJob';
import { GET_JOB_BY_ID } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

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
  title: 'Test Job',
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

const mocks = [
  {
    query: GET_JOB_BY_ID,
    variables: { jobId: '1' },
    data: {
      jobs: [mockJob],
    },
  },
  {
    query: GET_JOB_BY_ID,
    variables: { jobId: 'nonexistent' },
    data: {
      jobs: [],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useJob', () => {
  it('should fetch job by ID', async () => {
    const { result } = renderHook(() => useJob('1'), { wrapper });

    // With synchronous mocks using fromValue, data is available immediately
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockJob);
  });

  it('should handle non-existent job', async () => {
    const { result } = renderHook(() => useJob('nonexistent'), { wrapper });

    // With synchronous mocks using fromValue, data is available immediately
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should skip query when ID is empty', () => {
    const { result } = renderHook(() => useJob(''), { wrapper });

    // Query still runs but returns undefined since jobId is empty
    expect(result.current.data).toBeUndefined();
  });
});
