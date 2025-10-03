import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useCreatorClosedJobs from '../../../src/hooks/subsquid/useCreatorClosedJobs';
import { GET_CREATOR_CLOSED_JOBS } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

const mockJob = {
  id: '1',
  state: 4,
  title: 'Closed Job',
  roles: {
    creator: '0xCreator1',
    worker: null,
    arbitrator: '0xArbitrator',
  },
  amount: '1000000',
  token: '0xUSDC',
};

const mocks = [
  {
    request: {
      query: GET_CREATOR_CLOSED_JOBS,
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

describe('useCreatorClosedJobs', () => {
  it('should fetch creator closed jobs', async () => {
    const { result } = renderHook(
      () => useCreatorClosedJobs({ creatorAddress: '0xCreator1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].state).toBe(4);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useCreatorClosedJobs({ creatorAddress: '0xCreator1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
