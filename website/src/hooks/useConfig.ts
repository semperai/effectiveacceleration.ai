import { useEffect, useMemo, useState } from 'react';
import { useWalletClient } from 'wagmi';
import {Config, IConfig} from "@effectiveacceleration/contracts";

export const useConfig = () => {
  const [config, setConfig] = useState<IConfig>();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    setConfig(Config(walletClient?.chain.name ?? "Arbitrum One"));
  }, [walletClient]);

  return useMemo(() => config, [config]);
}
