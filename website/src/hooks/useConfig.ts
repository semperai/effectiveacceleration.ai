import { useEffect, useMemo, useState } from 'react';
import { useWalletClient } from 'wagmi';
import { Config, IConfig, StakingConfig, IStakingConfig } from '@effectiveacceleration/contracts';

type TConfig = IConfig & IStakingConfig;

export const useConfig = () => {
  const [config, setConfig] = useState<TConfig>();
  const { data: walletClient } = useWalletClient();


  useEffect(() => {
    let conf = Config('Arbitrum One');
    try {
      conf = Config(walletClient?.chain.name ?? 'Arbitrum One');
    } catch (e) {
      console.error(e);
    }

    setConfig({
      ...conf,
      ...StakingConfig('Ethereum'),
    });
  }, [walletClient]);

  return useMemo(() => config, [config]);
};
