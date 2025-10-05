import { renderHook, waitFor } from '@testing-library/react';
import useSquidStatus from '../../../src/hooks/subsquid/useSquidStatus';
import { GET_SQUID_STATUS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockStatus = {
  height: 1000000,
  indexerHeight: 999900,
  chainHeight: 1000000,
  syncing: false,
};

const mocks = [
  {
    query: GET_SQUID_STATUS,
    variables: {},
    data: {
      squidStatus: mockStatus,
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useSquidStatus', () => {
  it('should fetch squid indexer status', async () => {
    const { result } = renderHook(
      () => useSquidStatus(),
      { wrapper }
    );

    // With synchronous mocks using fromValue, data is available immediately
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockStatus);
  });
});
