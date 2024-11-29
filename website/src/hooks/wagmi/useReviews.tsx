import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Review } from '@effectiveacceleration/contracts';
import { useConfig } from '../useConfig';

export default function useReviews(targetAddress: string) {
  const Config = useConfig();
  const [reviews, setReviews] = useState<Review[]>([]);
  const { address } = useAccount();

  const result = useReadContract({
    account: address,
    abi: MARKETPLACE_DATA_V1_ABI,
    address: Config!.marketplaceDataAddress,
    functionName: 'getReviews',
    args: [targetAddress, 0n, 0n],
  });

  const reviewsData = result.data as Review[];
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (reviewsData) {
      setReviews(reviewsData);
    }
  }, [reviewsData]);

  return { data: reviews, ...rest };
}
