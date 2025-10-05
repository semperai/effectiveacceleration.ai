import { renderHook, waitFor } from '@testing-library/react';
import useCreatorDisputedJobs from '../../../src/hooks/subsquid/useCreatorDisputedJobs';
import { GET_CREATOR_DISPUTED_JOBS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockJob = {
  id: '1',
  state: 2,
  disputed: true,
  title: 'Disputed Job',
  roles: {
    creator: '0xCreator1',
    worker: '0xWorker',
    arbitrator: '0xArbitrator',
  },
  amount: '1000000',
  token: '0xUSDC',
};

const mocks = [
  {
    query: GET_CREATOR_DISPUTED_JOBS,
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

describe('useCreatorDisputedJobs', () => {
  it('should fetch creator disputed jobs', async () => {
    const { result } = renderHook(
      () => useCreatorDisputedJobs({ creatorAddress: '0xCreator1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].disputed).toBe(true);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useCreatorDisputedJobs({ creatorAddress: '0xCreator1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
