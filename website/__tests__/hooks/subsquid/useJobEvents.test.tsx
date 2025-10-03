import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import useJobEvents from '../../../src/hooks/subsquid/useJobEvents';
import { GET_JOB_EVENTS } from '../../../src/hooks/subsquid/queries';
import { ReactNode } from 'react';

const mockJobEvent = {
  id: 'event1',
  jobId: '1',
  type: 'Created',
  timestamp: '1234567890',
  address: '0xCreator',
  data: {},
};

const mockJobEvents = [
  mockJobEvent,
  {
    ...mockJobEvent,
    id: 'event2',
    type: 'Updated',
    timestamp: '1234567900',
  },
];

const mocks = [
  {
    request: {
      query: GET_JOB_EVENTS,
      variables: {
        jobId: '1',
        offset: 0,
        limit: 1000,
      },
    },
    result: {
      data: {
        jobEvents: mockJobEvents,
      },
    },
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe('useJobEvents', () => {
  it('should fetch job events', async () => {
    const { result } = renderHook(
      () => useJobEvents({ jobId: '1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].type).toBe('Created');
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useJobEvents({ jobId: '1', offset: 0, limit: 1000 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should support fake mode', () => {
    const { result } = renderHook(
      () => useJobEvents({ fake: true }),
      { wrapper }
    );

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
