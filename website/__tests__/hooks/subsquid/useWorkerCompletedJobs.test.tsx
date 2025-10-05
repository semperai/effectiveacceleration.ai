import { renderHook, waitFor } from '@testing-library/react';
import useWorkerCompletedJobs from '../../../src/hooks/subsquid/useWorkerCompletedJobs';
import { GET_WORKER_COMPLETED_JOBS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockJob = {
  id: '1',
  state: 3,
  title: 'Completed Job',
  roles: {
    creator: '0xCreator',
    worker: '0xWorker1',
    arbitrator: '0xArbitrator',
  },
  amount: '1000000',
  token: '0xUSDC',
  rating: 5,
};

const mocks = [
  {
    query: GET_WORKER_COMPLETED_JOBS,
    variables: {
      workerAddress: '0xWorker1',
    },
    data: {
      jobs: [mockJob],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useWorkerCompletedJobs', () => {
  it('should fetch worker completed jobs', async () => {
    const { result } = renderHook(
      () => useWorkerCompletedJobs('0xWorker1'),
      { wrapper }
    );

    // With synchronous mocks using fromValue, data is available immediately
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].state).toBe(3);
  });
});
