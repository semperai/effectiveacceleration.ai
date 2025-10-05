import { renderHook, waitFor } from '@testing-library/react';
import useArbitrator from '../../../src/hooks/subsquid/useArbitrator';
import { GET_ARBITRATOR_BY_ADDRESS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockArbitrator = {
  id: '0xArbitrator1',
  address_: '0xArbitrator1',
  publicKey: '0xPublicKey',
  name: 'Test Arbitrator',
  bio: 'Test bio',
  avatar: 'ipfs://avatar',
  fee: '5',
  settledCount: 10,
  refusedCount: 1,
};

const mocks = [
  {
    query: GET_ARBITRATOR_BY_ADDRESS,
    variables: {
      arbitratorAddress: '0xArbitrator1',
    },
    data: {
      arbitrators: [mockArbitrator],
    },
  },
  {
    query: GET_ARBITRATOR_BY_ADDRESS,
    variables: {
      arbitratorAddress: 'nonexistent',
    },
    data: {
      arbitrators: [],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useArbitrator', () => {
  it('should fetch arbitrator by address', async () => {
    const { result } = renderHook(
      () => useArbitrator('0xArbitrator1'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toMatchObject({
      address_: '0xArbitrator1',
      fee: '5',
    });
  });

  it('should return null for nonexistent arbitrator', async () => {
    const { result } = renderHook(
      () => useArbitrator('nonexistent'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeUndefined();
  });

  it('should return null when no address provided', () => {
    const { result } = renderHook(
      () => useArbitrator(''),
      { wrapper }
    );

    expect(result.current.data).toBeNull();
  });
});
