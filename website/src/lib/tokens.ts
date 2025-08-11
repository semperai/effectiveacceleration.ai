export interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
}

export const tokens: Token[] = [
  ...(process.env.NODE_ENV === 'development'
    ? [
        {
          id: '0x1235747639a5da96d3B52EffC0E179957C94Dc71',
          name: 'Fake Token',
          symbol: 'FAKE',
          icon: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
          decimals: 18,
        },
      ]
    : []),
  {
    id: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    name: 'USD Coin',
    symbol: 'USDC',
    icon: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
    decimals: 6,
  },
  {
    id: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    name: 'USDT',
    symbol: 'USDT',
    icon: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
    decimals: 6,
  },
  {
    id: '0x4a24B101728e07A52053c13FB4dB2BcF490CAbc3',
    name: 'Arbius',
    symbol: 'AIUS',
    icon: 'https://assets.coingecko.com/coins/images/35246/standard/arbius-200x-logo.png',
    decimals: 18,
  },
  {
    id: '0x9Eeab030a17528eFb2aC0F81D76fab8754e461BD',
    name: 'EACCToken',
    symbol: 'EACC',
    icon: '/eacc-200x200.png',
    decimals: 18,
  },
  {
    id: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    icon: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
    decimals: 18,
  },
];

export const tokensMap: Record<string, Token> = tokens.reduce(
  (acc, token) => {
    acc[token.id] = token;
    return acc;
  },
  {} as Record<string, Token>
);

export const formatTokenNameAndAmount = (
  tokenId: string,
  amount: bigint | undefined
) => {
  // Ensure we have a valid BigInt value
  let amountBigInt: bigint;

  if (amount === undefined || amount === null) {
    amountBigInt = 0n;
  } else if (typeof amount === 'bigint') {
    amountBigInt = amount;
  } else {
    // If amount is somehow not a bigint (e.g., number or string), convert it
    try {
      amountBigInt = BigInt(amount);
    } catch {
      console.error(
        'Invalid amount provided to formatTokenNameAndAmount:',
        amount
      );
      amountBigInt = 0n;
    }
  }

  // Get token decimals, default to 18 if token not found
  const decimals = tokensMap[tokenId]?.decimals ?? 18;

  // Calculate the amount with proper precision
  // Using 10000n for 4 decimal places of precision in the final display
  const precisionFactor = 10000n;
  const divisor = 10n ** BigInt(decimals);

  // Perform calculation entirely in BigInt to avoid mixing types
  const scaledAmount = (amountBigInt * precisionFactor) / divisor;

  // Convert to number only at the very end for display
  const amountNumber = Number(scaledAmount) / 10000;

  // Get token symbol
  const symbol = tokensMap[tokenId]?.symbol ?? 'UNKNOWN';

  return `${amountNumber} ${symbol}`;
};

export const tokenIcon = (tokenId: string) => {
  return tokensMap[tokenId]?.icon ?? '';
};
