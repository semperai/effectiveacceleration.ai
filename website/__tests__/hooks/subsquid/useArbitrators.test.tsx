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
      () => useArbitrators({ offset: 0, limit: 1000 }),
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

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useArbitrators({ offset: 0, limit: 1000 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });

  it('should support fake mode', () => {
    const { result } = renderHook(
      () => useArbitrators({ fake: true }),
      { wrapper }
    );

    expect(result.current.data).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
});
