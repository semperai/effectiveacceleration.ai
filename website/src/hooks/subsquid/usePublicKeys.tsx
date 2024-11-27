import { useState, useEffect } from "react";
import useUsersByAddresses from "../wagmi/useUsersByAddresses";

export default function usePublicKeys(targetAddresses: string[]) {
  const [publicKeys, setPublicKeys] = useState<Record<string, string>>({});

  const { data, ...rest } = useUsersByAddresses(targetAddresses);

  useEffect(() => {
    if (data) {
      const results: Record<string, string> = {};
      for (const user of Object.values(data)) {
        results[user.address_] = user.publicKey;
      }

      setPublicKeys((prev) => ({ ...prev, ...results }));
    }
  }, [data]);

  return { data: data ? publicKeys : undefined, ...rest };
}
