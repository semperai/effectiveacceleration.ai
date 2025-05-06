import { useEffect, useMemo, useState } from 'react';
import { useWalletClient } from 'wagmi';
import { Config, IConfig } from '@effectiveacceleration/contracts';

export const useConfig = () => {
  const [config, setConfig] = useState<IConfig>();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    try {
      setConfig(Config(walletClient?.chain.name ?? 'Arbitrum One'));
    } catch (error) {
      console.error('Error setting config:', error);
      setConfig('Arbitrum One' as unknown as IConfig);
    }
  }, [walletClient]);

  return useMemo(() => config, [config]);
};
