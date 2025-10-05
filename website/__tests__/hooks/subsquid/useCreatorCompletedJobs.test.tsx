import { renderHook, waitFor } from '@testing-library/react';
import useCreatorCompletedJobs from '../../../src/hooks/subsquid/useCreatorCompletedJobs';
import { GET_CREATOR_COMPLETED_JOBS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockJob = {
  id: '1',
  state: 3,
  title: 'Completed Job',
  roles: {
    creator: '0xCreator1',
    worker: '0xWorker',
    arbitrator: '0xArbitrator',
  },
  amount: '1000000',
  token: '0xUSDC',
  rating: 5,
};

const mocks = [
  {
    query: GET_CREATOR_COMPLETED_JOBS,
    variables: {
      creatorAddress: '0xCreator1',
      offset: 0,
      limit: 1000,
    },
    data: {
      jobs: [mockJob],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useCreatorCompletedJobs', () => {
  it('should fetch creator completed jobs', async () => {
    const { result } = renderHook(
      () => useCreatorCompletedJobs({ creatorAddress: '0xCreator1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].state).toBe(3);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useCreatorCompletedJobs({ creatorAddress: '0xCreator1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
