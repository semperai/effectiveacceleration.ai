import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useSquidStatus from '../../../src/hooks/subsquid/useSquidStatus';
import { GET_SQUID_STATUS } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

const mockStatus = {
  height: 1000000,
  indexerHeight: 999900,
  chainHeight: 1000000,
  syncing: false,
};

const mocks = [
  {
    request: {
      query: GET_SQUID_STATUS,
      variables: {},
    },
    result: {
      data: {
        squidStatus: mockStatus,
      },
    },
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe('useSquidStatus', () => {
  it('should fetch squid indexer status', async () => {
    const { result } = renderHook(
      () => useSquidStatus(),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.height).toBe(1000000);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useSquidStatus(),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
