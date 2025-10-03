import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useWorkerTakenJobs from '../../../src/hooks/subsquid/useWorkerTakenJobs';
import { GET_WORKER_TAKEN_JOBS } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

const mockJob = {
  id: '1',
  state: 1,
  title: 'Taken Job',
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
    request: {
      query: GET_WORKER_TAKEN_JOBS,
      variables: {
        workerAddress: '0xWorker1',
        offset: 0,
        limit: 1000,
      },
    },
    result: {
      data: {
        jobs: [mockJob],
      },
    },
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe('useWorkerTakenJobs', () => {
  it('should fetch worker taken jobs', async () => {
    const { result } = renderHook(
      () => useWorkerTakenJobs({ workerAddress: '0xWorker1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].roles.worker).toBe('0xWorker1');
    expect(result.current.data?.[0].state).toBe(1);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useWorkerTakenJobs({ workerAddress: '0xWorker1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
