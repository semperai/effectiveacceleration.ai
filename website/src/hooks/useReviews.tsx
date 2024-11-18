import { MARKETPLACE_DATA_V1_ABI } from "@effectiveacceleration/contracts/wagmi/MarketplaceDataV1";
import Config from "@effectiveacceleration/contracts/scripts/config.json";
import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Review } from "@effectiveacceleration/contracts";

export default function useReviews(targetAddress: `0x${string}`) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const { address } = useAccount();

  const result = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_V1_ABI,
    address:      Config.marketplaceDataAddress as `0x${string}`,
    functionName: 'getReviews',
    args:         [targetAddress, 0n, 0n],
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
