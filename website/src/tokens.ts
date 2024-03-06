import Config from '@/config.json';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string;
}

export const tokens: Token[] = [
  {
    id: Config.fakeTokenAddress,
    name: 'Test',
    symbol: 'TST',
    icon: '',
  },
  {
    id: '0x722e8bdd2ce80a4422e880164f2079488e115365',
    name: 'Ether',
    symbol: 'ETH',
    icon: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
  },
  {
    id: '0x8afe4055ebc86bd2afb3940c0095c9aca511d852',
    name: 'Arbius',
    symbol: 'AIUS',
    icon: 'https://assets.coingecko.com/coins/images/35246/standard/arbius-200x-logo.png',
  },
]
