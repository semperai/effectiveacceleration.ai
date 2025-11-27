'use client';

import { useAccount } from 'wagmi';
import { useConfig } from '@/hooks/useConfig';
import { useReadContract } from 'wagmi';
import { ERC20_ABI } from '@/lib/constants';
import { ConnectButton } from '@/components/ConnectButton';

export default function TestTokenPage() {
  const { address, isConnected, chain } = useAccount();
  const Config = useConfig();

  const fakeTokenAddress = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318' as `0x${string}`;

  const {
    data: allowanceData,
    isError: allowanceIsError,
    isLoading: allowanceIsLoading,
    error: allowanceError,
  } = useReadContract({
    address: fakeTokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [
      address as `0x${string}`,
      (Config as any)?.serviceMarketplaceAddress as `0x${string}`,
    ],
    query: {
      enabled: !!address && !!fakeTokenAddress && !!(Config as any)?.serviceMarketplaceAddress,
    },
  });

  const {
    data: balanceData,
    isError: balanceIsError,
    error: balanceError,
  } = useReadContract({
    address: fakeTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Token Approval Diagnostics</h1>

      <div className="space-y-6">
        {/* Connection Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Connection Status</h2>
          <div className="space-y-2">
            <p>
              <strong>Connected:</strong>{' '}
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Yes' : 'No'}
              </span>
            </p>
            {isConnected && (
              <>
                <p>
                  <strong>Address:</strong> {address}
                </p>
                <p>
                  <strong>Chain:</strong> {chain?.name} (ID: {chain?.id})
                </p>
                <p>
                  <strong>Expected Chain ID:</strong> 31337 (Hardhat)
                </p>
                <p>
                  <strong>Chain Match:</strong>{' '}
                  <span className={chain?.id === 31337 ? 'text-green-600' : 'text-red-600'}>
                    {chain?.id === 31337 ? 'Correct' : 'Wrong Network!'}
                  </span>
                </p>
              </>
            )}
            {!isConnected && (
              <div className="mt-4">
                <ConnectButton />
              </div>
            )}
          </div>
        </div>

        {/* Config Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Config Status</h2>
          <div className="space-y-2">
            <p>
              <strong>Config Loaded:</strong>{' '}
              <span className={Config ? 'text-green-600' : 'text-red-600'}>
                {Config ? 'Yes' : 'No'}
              </span>
            </p>
            {Config && (
              <>
                <p>
                  <strong>ServiceMarketplace Address:</strong>{' '}
                  {(Config as any)?.serviceMarketplaceAddress || 'Not found'}
                </p>
                <p>
                  <strong>FakeToken Address:</strong> {fakeTokenAddress}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Balance Check */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Token Balance</h2>
          <div className="space-y-2">
            {balanceIsError ? (
              <>
                <p className="text-red-600">
                  <strong>Error:</strong> Failed to fetch balance
                </p>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900">
                  {JSON.stringify(balanceError, null, 2)}
                </pre>
              </>
            ) : balanceData !== undefined ? (
              <p>
                <strong>TST Balance:</strong> {(Number(balanceData) / 1e18).toFixed(2)} TST
              </p>
            ) : (
              <p>Loading balance...</p>
            )}
          </div>
        </div>

        {/* Allowance Check */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Token Allowance</h2>
          <div className="space-y-2">
            <p>
              <strong>Query Enabled:</strong>{' '}
              {!!address && !!fakeTokenAddress && !!(Config as any)?.serviceMarketplaceAddress
                ? 'Yes'
                : 'No'}
            </p>
            <p>
              <strong>Loading:</strong> {allowanceIsLoading ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Error:</strong>{' '}
              <span className={allowanceIsError ? 'text-red-600' : 'text-green-600'}>
                {allowanceIsError ? 'Yes' : 'No'}
              </span>
            </p>

            {allowanceIsError ? (
              <>
                <p className="text-red-600">Failed to fetch allowance</p>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900">
                  {JSON.stringify(allowanceError, null, 2)}
                </pre>
              </>
            ) : allowanceData !== undefined ? (
              <>
                <p>
                  <strong>Current Allowance:</strong> {(Number(allowanceData) / 1e18).toFixed(2)}{' '}
                  TST
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  {Number(allowanceData) > 0 ? 'Approved ✓' : 'Not Approved (Need to approve)'}
                </p>
              </>
            ) : (
              <p>Loading allowance...</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-700 dark:bg-blue-900/20">
          <h2 className="mb-4 text-xl font-semibold">Next Steps</h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>Make sure MetaMask is connected to Hardhat network (Chain ID: 31337)</li>
            <li>Make sure you're using the test account that has TST tokens</li>
            <li>If all checks pass above, go to /post-service and try posting a service</li>
            <li>Select "TST" token from dropdown (it should appear in development mode)</li>
            <li>Click "Approve Token" button first, then "Submit Service Listing"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
