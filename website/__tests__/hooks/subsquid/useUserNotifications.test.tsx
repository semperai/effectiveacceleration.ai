import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useUserNotifications from '../../../src/hooks/subsquid/useUserNotifications';
import { GET_USER_NOTIFICATIONS, GET_JOBS_BY_IDS } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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
    request: {
      query: GET_USER_NOTIFICATIONS,
      variables: {
        userAddress: '0xUser1',
        minTimestamp: 0,
        offset: 0,
        limit: 10,
      },
    },
    result: {
      data: {
        notifications: [mockNotification],
      },
    },
  },
  {
    request: {
      query: GET_JOBS_BY_IDS,
      variables: {
        jobIds: ['job1'],
      },
    },
    result: {
      data: {
        jobs: [mockJob],
      },
    },
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

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
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].type).toBe(1);
    expect(result.current.data?.[0].read).toBe(false);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useUserNotifications('0xUser1', 0, 0, 10),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
