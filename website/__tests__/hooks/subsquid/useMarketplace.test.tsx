import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useMarketplace from '../../../src/hooks/subsquid/useMarketplace';
import { GET_MARKETPLACES } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

const mockMarketplace = {
  id: '1',
  totalJobs: 100,
  totalUsers: 50,
  totalArbitrators: 10,
  totalVolume: '10000000',
  updatedAt: '1234567890',
};

const mocks = [
  {
    request: {
      query: GET_MARKETPLACES,
      variables: {},
    },
    result: {
      data: {
        marketplaces: [mockMarketplace],
      },
    },
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe('useMarketplace', () => {
  it('should fetch marketplace stats', async () => {
    const { result } = renderHook(
      () => useMarketplace(),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.totalJobs).toBe(100);
    expect(result.current.data?.totalUsers).toBe(50);
    expect(result.current.data?.totalArbitrators).toBe(10);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useMarketplace(),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
