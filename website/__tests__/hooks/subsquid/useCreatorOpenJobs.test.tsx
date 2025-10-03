import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useCreatorOpenJobs from '../../../src/hooks/subsquid/useCreatorOpenJobs';
import { GET_CREATOR_OPEN_JOBS } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

const mockJob = {
  id: '1',
  state: 0,
  title: 'Open Job',
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
      query: GET_CREATOR_OPEN_JOBS,
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

describe('useCreatorOpenJobs', () => {
  it('should fetch creator open jobs', async () => {
    const { result } = renderHook(
      () => useCreatorOpenJobs({ creatorAddress: '0xCreator1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].state).toBe(0);
    expect(result.current.data?.[0].roles.worker).toBeNull();
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useCreatorOpenJobs({ creatorAddress: '0xCreator1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
