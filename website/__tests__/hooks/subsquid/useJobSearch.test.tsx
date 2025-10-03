import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useJobSearch from '../../../src/hooks/subsquid/useJobSearch';
import { GET_JOB_SEARCH } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

const mockJob = {
  id: '1',
  state: 0,
  title: 'Search Result Job',
  tags: ['digital-audio'],
  content: 'Test content with search term',
  roles: {
    creator: '0xCreator',
    worker: null,
    arbitrator: '0xArbitrator',
  },
  amount: '1000000',
  token: '0xUSDC',
};

// The query is dynamically generated, so we need to mock it
const searchQuery = GET_JOB_SEARCH({
  search: 'state_eq: 0',
  orderBy: 'timestamp_ASC',
  limit: 100,
  offset: 0,
});

const mocks = [
  {
    request: {
      query: searchQuery,
      variables: {},
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

describe('useJobSearch', () => {
  it('should search jobs by criteria', async () => {
    const { result } = renderHook(
      () => useJobSearch({
        jobSearch: { state: 0 },
        orderBy: 'timestamp_ASC',
        limit: 100,
        offset: 0,
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].title).toContain('Search');
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useJobSearch({
        jobSearch: { state: 0 },
        orderBy: 'timestamp_ASC',
        limit: 100,
        offset: 0,
      }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
