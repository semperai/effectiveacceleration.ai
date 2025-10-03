import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useCreatorCompletedJobs from '../../../src/hooks/subsquid/useCreatorCompletedJobs';
import { GET_CREATOR_COMPLETED_JOBS } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

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
    request: {
      query: GET_CREATOR_COMPLETED_JOBS,
      variables: {
        creatorAddress: '0xCreator1',
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
    expect(result.current.data?.[0].roles.creator).toBe('0xCreator1');
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useCreatorCompletedJobs({ creatorAddress: '0xCreator1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
