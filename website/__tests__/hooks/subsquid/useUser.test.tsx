import { renderHook, waitFor } from '@testing-library/react';
import useUser from '../../../src/hooks/subsquid/useUser';
import { GET_USER_BY_ADDRESS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockUser = {
  address_: '0x123',
  name: 'Test User',
  bio: 'Test bio',
  avatar: 'https://example.com/avatar.png',
  publicKey: '0xPublicKey',
  reputationUp: 10,
  reputationDown: 2,
  averageRating: 4.5,
  numberOfReviews: 5,
};

const mocks = [
  {
    query: GET_USER_BY_ADDRESS,
    variables: { userAddress: '0x123' },
    data: {
      users: [mockUser],
    },
  },
  {
    query: GET_USER_BY_ADDRESS,
    variables: { userAddress: '0xnonexistent' },
    data: {
      users: [],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useUser', () => {
  it('should fetch user by address', async () => {
    const { result } = renderHook(() => useUser('0x123'), { wrapper });

    // With synchronous mocks using fromValue, data is available immediately
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockUser);
  });

  it('should handle non-existent user', async () => {
    const { result } = renderHook(() => useUser('0xnonexistent'), { wrapper });

    // With synchronous mocks using fromValue, data is available immediately
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should skip query when address is empty', () => {
    const { result } = renderHook(() => useUser(''), { wrapper });

    // useUser returns null data with loading false when address is empty
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
