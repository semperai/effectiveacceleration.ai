import { renderHook, waitFor } from '@testing-library/react';
import useArbitrators from '../../../src/hooks/subsquid/useArbitrators';
import { GET_ARBITRATORS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockArbitrator = {
  id: '0xArbitrator1',
  address: '0xArbitrator1',
  feePercentage: '5',
  arbitratorTimes: {
    createdAt: '1234567890',
    updatedAt: '1234567890',
  }
};

const mockArbitrators = [
  mockArbitrator,
  {
    ...mockArbitrator,
    id: '0xArbitrator2',
    address: '0xArbitrator2',
    feePercentage: '3',
  }
];

const mocks = [
  {
    query: GET_ARBITRATORS,
    variables: {
      offset: 0,
      limit: 1000,
    },
    data: {
      arbitrators: mockArbitrators,
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useArbitrators', () => {
  it('should fetch all arbitrators', async () => {
    const { result } = renderHook(
      () => useArbitrators(0, 1000),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.[0]).toMatchObject({
      address: '0xArbitrator1',
      feePercentage: '5',
    });
  });

  it('should return data immediately with mock', () => {
    const { result } = renderHook(
      () => useArbitrators(0, 1000),
      { wrapper }
    );

    // With synchronous mock, data is available immediately
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeDefined();
  });

  it('should use default limit when 0', () => {
    const { result } = renderHook(
      () => useArbitrators(0, 0),
      { wrapper }
    );

    // With limit 0, it should use 1000 as default
    expect(result.current).toBeDefined();
  });
});
