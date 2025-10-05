import { renderHook, waitFor } from '@testing-library/react';
import useWorkerDisputedJobs from '../../../src/hooks/subsquid/useWorkerDisputedJobs';
import { GET_WORKER_DISPUTED_JOBS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockJob = {
  id: '1',
  state: 2,
  disputed: true,
  title: 'Disputed Job',
  roles: {
    creator: '0xCreator',
    worker: '0xWorker1',
    arbitrator: '0xArbitrator',
  },
  amount: '1000000',
  token: '0xUSDC',
};

const mocks = [
  {
    query: GET_WORKER_DISPUTED_JOBS,
    variables: {
      workerAddress: '0xWorker1',
      offset: 0,
      limit: 1000,
    },
    data: {
      jobs: [mockJob],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useWorkerDisputedJobs', () => {
  it('should fetch worker disputed jobs', async () => {
    const { result } = renderHook(
      () => useWorkerDisputedJobs({ workerAddress: '0xWorker1', offset: 0, limit: 1000 }),
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
      () => useWorkerDisputedJobs({ workerAddress: '0xWorker1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
