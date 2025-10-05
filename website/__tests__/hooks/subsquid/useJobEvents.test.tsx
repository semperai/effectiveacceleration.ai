import { renderHook, waitFor } from '@testing-library/react';
import useJobEvents from '../../../src/hooks/subsquid/useJobEvents';
import { GET_JOB_EVENTS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockJobEvent = {
  id: 'event1',
  jobId: '1',
  type: 'Created',
  timestamp: '1234567890',
  address: '0xCreator',
  data: {}
};

const mockJobEvents = [
  mockJobEvent,
  {
    ...mockJobEvent,
    id: 'event2',
    type: 'Updated',
    timestamp: '1234567900',
  }
];

const mocks = [
  {
    query: GET_JOB_EVENTS,
    variables: {
      jobId: '1',
    },
    data: {
      jobEvents: mockJobEvents,
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useJobEvents', () => {
  it('should fetch job events', async () => {
    const { result } = renderHook(
      () => useJobEvents('1'),
      { wrapper }
    );

    // With synchronous mocks using fromValue, data is available immediately
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toHaveLength(2);
  });
});
