import { renderHook, waitFor } from '@testing-library/react';
import useUsers from '../../../src/hooks/subsquid/useUsers';
import { GET_USERS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockUser1 = {
  id: '0xUser1',
  address: '0xUser1',
  publicKey: 'pk1',
  profileInfo: {
    name: 'User 1',
    about: 'Test user 1',
  },
  userTimes: {
    createdAt: '1234567890',
    updatedAt: '1234567890',
  }
};

const mockUser2 = {
  id: '0xUser2',
  address: '0xUser2',
  publicKey: 'pk2',
  profileInfo: {
    name: 'User 2',
    about: 'Test user 2',
  },
  userTimes: {
    createdAt: '1234567900',
    updatedAt: '1234567900',
  }
};

const mocks = [
  {
    query: GET_USERS,
    variables: {
      offset: 0,
      limit: 1000,
    },
    data: {
      users: [mockUser1, mockUser2],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useUsers', () => {
  it('should fetch all users', async () => {
    const { result } = renderHook(
      () => useUsers({ offset: 0, limit: 1000 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useUsers({ offset: 0, limit: 1000 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });

  it('should support fake mode', () => {
    const { result } = renderHook(
      () => useUsers({ fake: true }),
      { wrapper }
    );

    expect(result.current.data).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
});
