import { renderHook, waitFor } from '@testing-library/react';
import useUserNotifications from '../../../src/hooks/subsquid/useUserNotifications';
import { GET_USER_NOTIFICATIONS, GET_JOBS_BY_IDS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    }
  };
})();

const mockNotification = {
  id: '1',
  type: 1,
  address: '0xUser1',
  timestamp: 1234567890,
  jobId: 'job1',
};

const mockJob = {
  id: 'job1',
  title: 'Test Job',
  state: 0,
};

const mocks = [
  {
    query: GET_USER_NOTIFICATIONS,
    variables: {
      userAddress: '0xUser1',
      minTimestamp: 0,
      offset: 0,
      limit: 10,
    },
    data: {
      notifications: [mockNotification],
    },
  },
  {
    query: GET_JOBS_BY_IDS,
    variables: {
      jobIds: ['job1'],
    },
    data: {
      jobs: [mockJob],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useUserNotifications', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should fetch user notifications', async () => {
    const { result } = renderHook(
      () => useUserNotifications('0xUser1', 0, 0, 10),
      { wrapper }
    );

    await waitFor(() => {
      // useUserNotifications depends on useJobsByIds, so it may take longer
      expect(result.current.data).toBeDefined();
    });
  });
});
