import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useCreatorDisputedJobs from '../../../src/hooks/subsquid/useCreatorDisputedJobs';
import { GET_CREATOR_DISPUTED_JOBS } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

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
    request: {
      query: GET_CREATOR_DISPUTED_JOBS,
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
    expect(result.current.data?.[0].roles.creator).toBe('0xCreator1');
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useCreatorDisputedJobs({ creatorAddress: '0xCreator1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
