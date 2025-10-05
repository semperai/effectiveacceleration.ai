import { renderHook, waitFor } from '@testing-library/react';
import useUsersByAddresses from '../../../src/hooks/subsquid/useUsersByAddresses';
import { GET_USERS_BY_ADDRESSES } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockUser1 = {
  id: '0xUser1',
  address: '0xUser1',
  publicKey: 'pk1',
  profileInfo: {
    name: 'User 1',
  }
};

const mockUser2 = {
  id: '0xUser2',
  address: '0xUser2',
  publicKey: 'pk2',
  profileInfo: {
    name: 'User 2',
  }
};

const mocks = [
  {
    query: GET_USERS_BY_ADDRESSES,
    variables: {
      addresses: ['0xUser1', '0xUser2'],
    },
    data: {
      users: [mockUser1, mockUser2],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useUsersByAddresses', () => {
  it('should fetch multiple users by addresses', async () => {
    const { result } = renderHook(
      () => useUsersByAddresses({ addresses: ['0xUser1', '0xUser2'] }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useUsersByAddresses({ addresses: ['0xUser1', '0xUser2'] }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
