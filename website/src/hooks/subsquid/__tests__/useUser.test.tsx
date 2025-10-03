import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useUser from '../useUser';
import { GET_USER_BY_ADDRESS } from '../queries';
import { ReactNode } from 'react';

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
    request: {
      query: GET_USER_BY_ADDRESS,
      variables: { userAddress: '0x123' },
    },
    result: {
      data: {
        users: [mockUser],
      },
    },
  },
  {
    request: {
      query: GET_USER_BY_ADDRESS,
      variables: { userAddress: '0xnonexistent' },
    },
    result: {
      data: {
        users: [],
      },
    },
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe('useUser', () => {
  it('should fetch user by address', async () => {
    const { result } = renderHook(() => useUser('0x123'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockUser);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useUser('0x123'), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it('should handle non-existent user', async () => {
    const { result } = renderHook(() => useUser('0xnonexistent'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeUndefined();
  });

  it('should skip query when address is empty', () => {
    const { result } = renderHook(() => useUser(''), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });
});
