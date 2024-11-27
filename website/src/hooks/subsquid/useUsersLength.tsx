import { useMemo } from "react";
import useMarketplace from "./useMarketplace";

export default function useUsersLength() {
  const { data, ...rest } = useMarketplace();

  return useMemo(() => ({ data: data ? (data as any).userCount : undefined, ...rest }), [data, rest]);
}
