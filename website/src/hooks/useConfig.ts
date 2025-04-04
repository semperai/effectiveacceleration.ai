import { useEffect, useMemo, useState } from 'react';
import { useWalletClient } from 'wagmi';
import { Config, IConfig, StakingConfig, IStakingConfig } from '@effectiveacceleration/contracts';

type TConfig = IConfig & IStakingConfig;

export const useConfig = () => {
  const [config, setConfig] = useState<TConfig>();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    setConfig({
       ...Config(walletClient?.chain.name ?? 'Arbitrum One'),
       ...StakingConfig('Ethereum'),
    });
  }, [walletClient]);

  return useMemo(() => config, [config]);
};
