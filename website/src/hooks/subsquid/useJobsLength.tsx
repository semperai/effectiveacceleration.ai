import { useMemo } from "react";
import useMarketplace from "./useMarketplace";

export default function useJobsLength() {
  const { data, ...rest } = useMarketplace();

  return useMemo(() => ({ data: data ? (data as any).jobCount : undefined, ...rest }), [data, rest]);
}