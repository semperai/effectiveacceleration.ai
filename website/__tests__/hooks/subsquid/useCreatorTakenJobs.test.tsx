import { renderHook, waitFor } from '@testing-library/react';
import useCreatorTakenJobs from '../../../src/hooks/subsquid/useCreatorTakenJobs';
import { GET_CREATOR_TAKEN_JOBS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockJob = {
  id: '1',
  state: 1,
  title: 'Taken Job',
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
    query: GET_CREATOR_TAKEN_JOBS,
    variables: {
      creatorAddress: '0xCreator1',
    },
    data: {
      jobs: [mockJob],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useCreatorTakenJobs', () => {
  it('should fetch creator taken jobs', async () => {
    const { result } = renderHook(
      () => useCreatorTakenJobs('0xCreator1'),
      { wrapper }
    );

    // With synchronous mocks using fromValue, data is available immediately
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].state).toBe(1);
  });
});
