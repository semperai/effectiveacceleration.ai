import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useArbitrators from '../../../src/hooks/subsquid/useArbitrators';
import { GET_ARBITRATORS } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

const mockArbitrator = {
  id: '0xArbitrator1',
  address: '0xArbitrator1',
  feePercentage: '5',
  arbitratorTimes: {
    createdAt: '1234567890',
    updatedAt: '1234567890',
  },
};

const mockArbitrators = [
  mockArbitrator,
  {
    ...mockArbitrator,
    id: '0xArbitrator2',
    address: '0xArbitrator2',
    feePercentage: '3',
  },
];

const mocks = [
  {
    request: {
      query: GET_ARBITRATORS,
      variables: {
        offset: 0,
        limit: 1000,
      },
    },
    result: {
      data: {
        arbitrators: mockArbitrators,
      },
    },
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe('useArbitrators', () => {
  it('should fetch all arbitrators', async () => {
    const { result } = renderHook(
      () => useArbitrators({ offset: 0, limit: 1000 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
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
    expect(result.current.data).toBeUndefined();
  });

  it('should support fake mode', () => {
    const { result } = renderHook(
      () => useArbitrators({ fake: true }),
      { wrapper }
    );

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
