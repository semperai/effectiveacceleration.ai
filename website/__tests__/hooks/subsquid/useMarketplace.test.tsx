import { renderHook, waitFor } from '@testing-library/react';
import useMarketplace from '../../../src/hooks/subsquid/useMarketplace';
import { GET_MARKETPLACES } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

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
    query: GET_MARKETPLACES,
    variables: {},
    data: {
      marketplaces: [mockMarketplace],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useMarketplace', () => {
  it('should fetch marketplace stats', async () => {
    const { result } = renderHook(
      () => useMarketplace(),
      { wrapper }
    );

    // With synchronous mocks using fromValue, data is available immediately
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockMarketplace);
  });
});
