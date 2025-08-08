'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import tokenLogo from '@/images/token-logo-box.png';
import {
  Card,
  CardContent,
} from '@/components/Card';
import {
  ArrowRight,
  Coins,
  Users,
} from 'lucide-react';

export const TokenSection = () => {
  const { address, isConnected } = useAccount();

  return (
    <div className='rounded-2xl bg-gray-50 p-8'>
      <div className='mb-6 flex items-center gap-6'>
        <Image src={tokenLogo} alt='EACC Token' width={80} height={80} />
        <div>
          <h2 className='mb-2 text-2xl font-bold'>$EACC Token</h2>
          <p className='text-gray-600'>Governance and utility token</p>
        </div>
      </div>
      <div className='space-y-4'>
        <p className='text-gray-800'>
          Receive 100 EACC tokens for every dollar spent or earned on the
          platform. Wield them to influence platform decisions through DAO
          voting, boost your listings&apos; visibility, and unlock advanced
          features that give you an edge in the future economy.
        </p>

        {/* Contract Address */}
        <div className='rounded-lg border border-gray-300 bg-white p-4'>
          <div className='mb-1 text-sm text-gray-600'>Contract Address (Arbitrum)</div>
          <div className='flex items-center justify-between'>
            <code className='font-mono text-sm text-gray-700'>
              0x9Eeab030a17528eFb2aC0F81D76fab8754e461BD
            </code>
            <button
              onClick={() => navigator.clipboard.writeText('0x9Eeab030a17528eFb2aC0F81D76fab8754e461BD')}
              className='ml-2 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100'
              title='Copy to clipboard'
            >
              Copy
            </button>
          </div>
        </div>

        <div className='flex gap-4'>
          <Card className='flex-1 bg-white'>
            <CardContent className='pt-6'>
              <Coins className='mb-2 h-6 w-6 text-blue-600' />
              <div className='text-2xl font-bold'>6.97B</div>
              <div className='text-gray-600'>Total Supply</div>
            </CardContent>
          </Card>
          <Card className='flex-1 bg-white'>
            <CardContent className='pt-6'>
              <Users className='mb-2 h-6 w-6 text-blue-600' />
              <div className='text-2xl font-bold'>66%</div>
              <div className='text-gray-600'>Distributed</div>
            </CardContent>
          </Card>
        </div>

        {/* Buy on Uniswap Button */}
        <div className='flex gap-4 pt-4'>
          <Link
            href='https://app.uniswap.org/swap?chain=arbitrum&outputCurrency=0x9Eeab030a17528eFb2aC0F81D76fab8754e461BD'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105'
          >
            Buy on Uniswap
            <ArrowRight className='h-4 w-4' />
          </Link>

          <button
            onClick={async () => {
              if (!isConnected) {
                alert('Please connect your wallet first');
                return;
              }
              try {
                await window.ethereum.request({
                  method: 'wallet_watchAsset',
                  params: {
                    type: 'ERC20',
                    options: {
                      address: '0x9Eeab030a17528eFb2aC0F81D76fab8754e461BD',
                      symbol: 'EACC',
                      decimals: 18,
                      image: window.location.origin + '/eacc-200x200.png',
                    },
                  },
                });
              } catch (error) {
                console.error('Error adding token to MetaMask:', error);
              }
            }}
            disabled={!isConnected}
            className={`inline-flex items-center gap-2 rounded-lg border-2 px-6 py-3 font-semibold shadow-lg transition-all ${
              isConnected
                ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl cursor-pointer'
                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={!isConnected ? 'Connect wallet to add token' : 'Add EACC token to MetaMask'}
          >
            Add to MetaMask
            <Image src="/metamask-fox.svg" alt="MetaMask" width={20} height={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

