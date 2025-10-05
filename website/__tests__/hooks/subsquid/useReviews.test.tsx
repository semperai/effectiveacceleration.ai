import { renderHook, waitFor } from '@testing-library/react';
import useReviews from '../../../src/hooks/subsquid/useReviews';
import { GET_REVIEWS } from '../../../src/hooks/subsquid/queries';
import { createUrqlWrapper } from '../../setup/mocks/urql';

const mockReview = {
  id: '1',
  jobId: '1',
  reviewerId: '0xCreator',
  revieweeId: '0xWorker',
  user: '0xWorker',
  rating: 5,
  comment: 'Great work!',
  timestamp: '1234567890',
};

const mocks = [
  {
    query: GET_REVIEWS,
    variables: {
      targetAddress: '0xWorker',
      offset: 0,
      limit: 100,
    },
    data: {
      reviews: [mockReview],
    },
  },
];

const wrapper = createUrqlWrapper(mocks);

describe('useReviews', () => {
  it('should fetch user reviews', async () => {
    const { result } = renderHook(
      () => useReviews('0xWorker', 0, 100),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].rating).toBe(5);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useReviews('0xWorker', 0, 100),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });
});
