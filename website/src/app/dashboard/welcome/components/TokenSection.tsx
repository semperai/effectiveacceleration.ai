// src/app/dashboard/welcome/components/TokenSection.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ArrowRight, Coins, Users, TrendingUp, Copy, CheckCircle, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/Card';
import { useState, useEffect } from 'react';

const TOKEN_ADDRESS = '0x9Eeab030a17528eFb2aC0F81D76fab8754e461BD';

export const TokenSection = () => {
  const { isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [marketCap, setMarketCap] = useState<string | null>(null);
  const [marketCapLoading, setMarketCapLoading] = useState(true);
  const [circulatingSupply, setCirculatingSupply] = useState<string | null>(null);
  const [circulatingLoading, setCirculatingLoading] = useState(true);

  // Fetch market cap and circulating supply on mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch market cap
      try {
        const response = await fetch('/api/market_cap');
        if (response.ok) {
          const value = await response.text();
          // Format the number with commas and convert to millions
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            const formatted = numValue >= 1_000_000 
              ? `${(numValue / 1_000_000).toFixed(2)}M`
              : numValue >= 1_000
              ? `${(numValue / 1_000).toFixed(2)}K`
              : `${numValue.toFixed(2)}`;
            setMarketCap(formatted);
          }
        }
      } catch (error) {
        console.error('Error fetching market cap:', error);
      } finally {
        setMarketCapLoading(false);
      }

      // Fetch circulating supply
      try {
        const response = await fetch('/api/circulating_supply');
        if (response.ok) {
          const value = await response.text();
          // Calculate percentage of total supply (6,969,696,969)
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            const percentage = (numValue / 6_969_696_969) * 100;
            const formatted = `${percentage.toFixed(1)}%`;
            setCirculatingSupply(formatted);
          }
        }
      } catch (error) {
        console.error('Error fetching circulating supply:', error);
      } finally {
        setCirculatingLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(TOKEN_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToMetaMask = async () => {
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
            address: TOKEN_ADDRESS,
            symbol: 'EACC',
            decimals: 18,
            image: window.location.origin + '/eacc-200x200.png',
          },
        },
      });
    } catch (error) {
      console.error('Error adding token to MetaMask:', error);
    }
  };

  const tokenStats = [
    { icon: Coins, label: 'Total Supply', value: '6.97B', color: 'blue' },
    { 
      icon: Users, 
      label: 'Distributed', 
      value: circulatingSupply || '---',
      loading: circulatingLoading,
      color: 'green' 
    },
    { 
      icon: TrendingUp, 
      label: 'Market Cap', 
      value: marketCap || '---',
      loading: marketCapLoading,
      color: 'purple' 
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with logo */}
        <div className="mb-8 flex items-center justify-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur-xl" />
            <Image
              src="/eacc-200x200.png"
              alt="EACC Token"
              width={80}
              height={80}
              className="relative rounded-2xl"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              $EACC Token
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Dividend bearing governance token
            </p>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left side - Info and actions */}
          <div>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              The EACC token powers the Effective Acceleration ecosystem. Earn tokens by 
              participating in the platform and receive dividends from platform fees.
            </p>

            {/* Earning info */}
            <div className="mb-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Earn 100 EACC per $1
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    For every dollar spent or earned on completed jobs
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Address */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Contract Address (Arbitrum)
              </div>
              <div className="flex items-center justify-between">
                <code className="font-mono text-xs text-gray-800 dark:text-gray-200">
                  {TOKEN_ADDRESS}
                </code>
                <button
                  onClick={handleCopy}
                  className="ml-2 rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href={`https://app.uniswap.org/swap?chain=arbitrum&outputCurrency=${TOKEN_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                Buy on Uniswap
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                onClick={handleAddToMetaMask}
                disabled={!isConnected}
                className={`inline-flex items-center gap-2 rounded-xl border-2 px-6 py-3 font-semibold shadow transition-all duration-300 ${
                  isConnected
                    ? 'border-gray-300 bg-white text-gray-700 hover:scale-105 hover:bg-gray-50 hover:shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                    : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                }`}
                title={!isConnected ? 'Connect wallet to add token' : 'Add EACC token to MetaMask'}
              >
                Add to MetaMask
                <Image src="/metamask-fox.svg" alt="MetaMask" width={20} height={20} />
              </button>
            </div>
          </div>

          {/* Right side - Stats and benefits */}
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {tokenStats.map((stat) => {
                const Icon = stat.icon;
                const colorClasses = {
                  blue: 'text-blue-600 dark:text-blue-400',
                  green: 'text-green-600 dark:text-green-400',
                  purple: 'text-purple-600 dark:text-purple-400',
                };

                return (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-white p-4 text-center shadow-sm dark:bg-gray-800"
                  >
                    <Icon className={`mx-auto mb-2 h-6 w-6 ${colorClasses[stat.color as keyof typeof colorClasses]}`} />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {stat.loading ? (
                        <div className="inline-block h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Token Benefits */}
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                Token Benefits
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    🗳️ Governance Rights
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Vote on platform decisions and upgrades
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    💰 Dividend Rewards
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    100% of platform fees (6.9%) distributed to EACC holders
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    🚀 Platform Benefits
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Boost job visibility and access premium features
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
