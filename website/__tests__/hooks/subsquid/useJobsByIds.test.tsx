import { renderHook, waitFor } from '@testing-library/react';
import useJobsByIds from '../../../src/hooks/subsquid/useJobsByIds';
import { GET_JOBS_BY_IDS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockJob1 = {
  id: '1',
  state: 0,
  title: 'Test Job 1',
  roles: {
    creator: '0xCreator',
    worker: null,
    arbitrator: '0xArbitrator',
  },
  amount: '1000000',
  token: '0xUSDC',
};

const mockJob2 = {
  id: '2',
  state: 1,
  title: 'Test Job 2',
  roles: {
    creator: '0xCreator2',
    worker: '0xWorker',
    arbitrator: '0xArbitrator',
  },
  amount: '2000000',
  token: '0xUSDC',
};

const mocks = [
  {
    query: GET_JOBS_BY_IDS,
    variables: {
      jobIds: ['1', '2'],
    },
    data: {
      jobs: [mockJob1, mockJob2],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useJobsByIds', () => {
  it('should fetch multiple jobs by IDs', async () => {
    const { result } = renderHook(
      () => useJobsByIds({ jobIds: ['1', '2'] }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useJobsByIds({ jobIds: ['1', '2'] }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
