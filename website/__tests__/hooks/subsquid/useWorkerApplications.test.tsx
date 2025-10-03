import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useWorkerApplications from '../../../src/hooks/subsquid/useWorkerApplications';
import { GET_WORKER_APPLICATIONS } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

const mockJob = {
  id: '1',
  title: 'Job Title',
  state: 0,
  roles: {
    creator: '0xCreator',
    worker: null,
    arbitrator: '0xArbitrator',
  },
  amount: '1000000',
  token: '0xUSDC',
};

const mocks = [
  {
    request: {
      query: GET_WORKER_APPLICATIONS,
      variables: {
        workerAddress: '0xWorker1',
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

describe('useWorkerApplications', () => {
  it('should fetch jobs worker has applied to', async () => {
    const { result } = renderHook(
      () => useWorkerApplications('0xWorker1'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].title).toBe('Job Title');
    expect(result.current.data?.[0].state).toBe(0);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useWorkerApplications('0xWorker1'),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
