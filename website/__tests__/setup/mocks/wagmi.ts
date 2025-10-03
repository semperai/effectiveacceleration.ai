import { http, createConfig } from 'wagmi';
import { arbitrum, mainnet } from 'wagmi/chains';
import { mock } from 'wagmi/connectors';

export const mockWagmiConfig = createConfig({
  chains: [mainnet, arbitrum],
  connectors: [
    mock({
      accounts: [
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      ],
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
  },
});

export const mockAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
export const mockAccount2 = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
