import Config from 'effectiveacceleration-contracts/scripts/config.json'

export interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
}

export const tokens: Token[] = [
  {
    id: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    name: 'USDT',
    symbol: 'USDT',
    icon: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
    decimals: 2,
  },
  {
    id: Config.fakeTokenAddress,
    name: 'Test',
    symbol: 'TTK',
    icon: 'https://assets.coingecko.com/coins/images/31188/standard/IMG_6480.png',
    decimals: 18,
  },
  {
    id: '0x722e8bdd2ce80a4422e880164f2079488e115365',
    name: 'Ether',
    symbol: 'ETH',
    icon: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
    decimals: 18,
  },
  {
    id: '0x8afe4055ebc86bd2afb3940c0095c9aca511d852',
    name: 'Arbius',
    symbol: 'AIUS',
    icon: 'https://assets.coingecko.com/coins/images/35246/standard/arbius-200x-logo.png',
    decimals: 18,
  },
]

export const tokensMap: Record<string, Token> = tokens.reduce((acc, token) => {
  acc[token.id] = token;
  return acc;
}, {} as Record<string, Token>);

export const formatTokenNameAndAmount = (tokenId: string, amount: bigint | undefined) => {
  const amountBigint = (amount ?? 0n) * 10000n / 10n ** BigInt(tokensMap[tokenId]?.decimals ?? 0);
  const amountNumber = Number(amountBigint) / 10000;
  return `${amountNumber} ${tokensMap[tokenId]?.symbol ?? ""}`;
}

export const tokenIcon = (tokenId: string) => {
  return tokensMap[tokenId]?.icon ?? "";
}