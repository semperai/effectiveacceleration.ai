import { fake } from './preferredArbitrumTokens';

interface IArbitrumToken {
  logoURI?: string;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  extensions?: any;
  l1Address?: string;
  l2GatewayAddress?: string;
  l1GatewayAddress?: string;
}

export const mockTokens = (tokens: IArbitrumToken[]) => {
  if (tokens.length === 0) return tokens;

  if (process.env.NODE_ENV !== 'development') return tokens;

  return tokens.map((token) => {
    if (token.symbol === 'ETH') {
      return {
        ...token,
        address: fake.ETH_ADDRESS,
      };
    }

    if (token.symbol === 'USDT') {
      return {
        ...token,
        address: fake.USDT_ADDRESS,
      };
    }

    if (token.symbol === 'USDC') {
      return {
        ...token,
        address: fake.USDC_ADDRESS,
      };
    }

    if (token.symbol === 'DAI') {
      return {
        ...token,
        address: fake.DAI_ADDRESS,
      };
    }

    return token;
  });
};
