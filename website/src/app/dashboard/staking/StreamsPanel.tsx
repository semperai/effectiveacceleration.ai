'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { useToast } from '@/hooks/useToast';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { ARBITRUM_CHAIN_ID } from '@/hooks/wagmi/useStaking';
import { formatEther } from 'viem';

// Sablier Lockup ABI
const SABLIER_LOCKUP_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }],
    name: 'withdrawMax',
    outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

// Interface representing processed stream data
interface Stream {
  id: string;
  deposit: string;
  token: string;
  tokenSymbol: string;
  startTime: Date;
  endTime: Date;
  lockupAmount: string;
  withdrawnAmount: string;
  remainingAmount: string;
  percentComplete: number;
  isActive: boolean;
  isWithdrawing: boolean;
}

// GraphQL Types
interface GraphQLStream {
  id: string;
  tokenId: string;
  recipient: string;
  funder: string;
  endTime: string; // Unix timestamp
  duration: string;
  depositAmount: string;
  withdrawnAmount: string;
  sender: string;
  startTime: string; // Unix timestamp
  canceledTime: string | null;
  canceled: boolean;
}

export function StreamsPanel() {
  const { address, isConnected, chain } = useAccount();
  const Config = useConfig();
  const { writeContractWithNotifications, isConfirming, isConfirmed, error } = useWriteContractWithNotifications();
  const { showError, showSuccess } = useToast();

  // UI States
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [streams, setStreams] = useState<Stream[]>([]);

  // Check if user is on Arbitrum One
  const isArbitrumOne = chain?.id === ARBITRUM_CHAIN_ID;

  // Fetch streams data from GraphQL
  useEffect(() => {
    const fetchStreams = async () => {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Create static values for the query to prevent infinite render loops
        const userAddress = address.toLowerCase();
        const tokenAddress = Config?.EACCAddress ? `${Config.EACCAddress.toLowerCase()}-42161` : '';

        // Construct the GraphQL query
        const query = `
          query FetchStreams {
            Stream(
              where: {
                chainId: {_eq: "42161"},
                recipient: {_eq: "${userAddress}"},
                asset_id: {_eq: "${tokenAddress}"}
              }
            ) {
              id
              tokenId
              recipient
              funder
              endTime
              duration
              depositAmount
              withdrawnAmount
              sender
              startTime
              canceledTime
              canceled
            }
          }
        `;

        const response = await fetch('https://indexer.hyperindex.xyz/53b7e25/v1/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        // Process the GraphQL data
        const graphqlStreams: GraphQLStream[] = result.data.Stream || [];

        // Map GraphQL data to our Stream interface
        const processedStreams: Stream[] = graphqlStreams.map(graphStream => {
          const startTime = new Date(parseInt(graphStream.startTime) * 1000);
          const endTime = new Date(parseInt(graphStream.endTime) * 1000);
          const now = new Date();

          const deposit = formatEther(BigInt(graphStream.depositAmount));
          const withdrawn = formatEther(BigInt(graphStream.withdrawnAmount));
          const remaining = (parseFloat(deposit) - parseFloat(withdrawn)).toString();

          // Calculate percent complete
          const totalDuration = endTime.getTime() - startTime.getTime();
          const elapsedDuration = Math.min(now.getTime() - startTime.getTime(), totalDuration);
          const percentComplete = Math.floor((elapsedDuration / totalDuration) * 100);

          // Determine if stream is active
          const isActive = !graphStream.canceled && now < endTime;

          return {
            id: graphStream.id,
            deposit,
            token: Config?.EACCAddress || '',
            tokenSymbol: 'EACC',
            startTime,
            endTime,
            lockupAmount: deposit,
            withdrawnAmount: withdrawn,
            remainingAmount: remaining,
            percentComplete,
            isActive,
            isWithdrawing: false
          };
        });

        setStreams(processedStreams);
      } catch (error) {
        console.error('Error fetching streams:', error);
        Sentry.captureException(error);
        showError('Failed to load stream data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreams();

    // Only re-run this effect when these specific dependencies change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected]);

  // Reset loading state and show error when error occurs
  useEffect(() => {
    if (error) {
      showError("An error occurred with your stream operation. Please try again.");

      // Reset withdrawing state
      setStreams(prevStreams =>
        prevStreams.map(stream => ({
          ...stream,
          isWithdrawing: false
        }))
      );
    }
  }, [error, showError]);

  // Handle refresh after confirmed transaction
  useEffect(() => {
    if (isConfirmed) {
      showSuccess("Stream operation completed successfully");

      // Reset withdrawing state
      setStreams(prevStreams =>
        prevStreams.map(stream => ({
          ...stream,
          isWithdrawing: false
        }))
      );

      // Create a small delay before refreshing to avoid race conditions
      const timer = setTimeout(() => {
        handleRefresh();
      }, 1000);

      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  // Load streams on component mount or when address, isConnected, or Config changes
  useEffect(() => {
    handleRefresh();
  }, [address, isConnected, Config]);

  // Handle withdraw from stream
  const handleWithdraw = async (streamId: string) => {
    if (!isConnected || !Config?.sablierLockupAddress || !isArbitrumOne) return;

    // Update withdrawing state
    setStreams(prevStreams =>
      prevStreams.map(stream =>
        stream.id === streamId ? { ...stream, isWithdrawing: true } : stream
      )
    );

    try {
      await writeContractWithNotifications({
        address: Config.sablierLockupAddress,
        abi: SABLIER_LOCKUP_ABI,
        functionName: 'withdrawMax',
        args: [BigInt(streamId)],
      });
    } catch (error) {
      Sentry.captureException(error);
      showError(`Error withdrawing from stream #${streamId}. Please try again.`);
      console.error("Error withdrawing from stream:", error);

      // Reset withdrawing state
      setStreams(prevStreams =>
        prevStreams.map(stream =>
          stream.id === streamId ? { ...stream, isWithdrawing: false } : stream
        )
      );
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setIsLoading(true);

    // Create a manual fetch function that doesn't depend on the useEffect
    const manualFetch = async () => {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      try {
        // Create static values for the query
        const userAddress = address.toLowerCase();
        const tokenAddress = Config?.EACCAddress ? `${Config.EACCAddress.toLowerCase()}-42161` : '';

        const query = `
          query FetchStreams {
            Stream(
              where: {
                chainId: {_eq: "42161"},
                recipient: {_eq: "${userAddress}"},
                asset_id: {_eq: "${tokenAddress}"}
              }
            ) {
              id
              tokenId
              recipient
              funder
              endTime
              duration
              depositAmount
              withdrawnAmount
              sender
              startTime
              canceledTime
              canceled
            }
          }
        `;

        const response = await fetch('https://indexer.hyperindex.xyz/53b7e25/v1/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
          cache: 'no-store', // Prevent caching
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        // Process the GraphQL data
        const graphqlStreams: GraphQLStream[] = result.data.Stream || [];

        // Map GraphQL data to our Stream interface
        const processedStreams: Stream[] = graphqlStreams.map(graphStream => {
          const startTime = new Date(parseInt(graphStream.startTime) * 1000);
          const endTime = new Date(parseInt(graphStream.endTime) * 1000);
          const now = new Date();

          const deposit = formatEther(BigInt(graphStream.depositAmount));
          const withdrawn = formatEther(BigInt(graphStream.withdrawnAmount));
          const remaining = (parseFloat(deposit) - parseFloat(withdrawn)).toString();

          // Calculate percent complete
          const totalDuration = endTime.getTime() - startTime.getTime();
          const elapsedDuration = Math.min(now.getTime() - startTime.getTime(), totalDuration);
          const percentComplete = Math.floor((elapsedDuration / totalDuration) * 100);

          // Determine if stream is active
          const isActive = !graphStream.canceled && now < endTime;

          return {
            id: graphStream.id,
            deposit,
            token: Config?.EACCAddress || '',
            tokenSymbol: 'EACC',
            startTime,
            endTime,
            lockupAmount: deposit,
            withdrawnAmount: withdrawn,
            remainingAmount: remaining,
            percentComplete,
            isActive,
            isWithdrawing: false
          };
        });

        setStreams(processedStreams);
      } catch (error) {
        console.error('Error fetching streams:', error);
        Sentry.captureException(error);
        showError('Failed to load stream data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Call the manual fetch function instead of trying to trigger the useEffect
    manualFetch();
  };

  // Filter streams based on active filter
  const filteredStreams = streams.filter(stream => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return stream.isActive;
    if (activeFilter === 'completed') return !stream.isActive;
    return true;
  });

  // Format date to readable string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate remaining time in days
  const getRemainingDays = (endTime: Date) => {
    const now = new Date();
    const diffTime = endTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Streams</h2>
        <div className="flex space-x-2">
          <div className="flex bg-gray-100 rounded-md p-1 mr-2 text-sm">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-1 rounded ${activeFilter === 'active' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1 rounded ${activeFilter === 'completed' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
            >
              Completed
            </button>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isLoading || isConfirming}
            className="text-sm px-3"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredStreams.length > 0 ? (
        <div className="space-y-4">
          {filteredStreams.map((stream) => (
            <div key={stream.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold mr-2">
                      {parseFloat(stream.deposit).toFixed(4)} {stream.tokenSymbol}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      stream.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {stream.isActive ? 'Active' : 'Completed'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Stream #{stream.id}</p>
                </div>
                <Button
                  onClick={() => handleWithdraw(stream.id)}
                  disabled={
                    !stream.isActive ||
                    parseFloat(stream.remainingAmount) <= 0 ||
                    stream.isWithdrawing ||
                    isConfirming
                  }
                  className="text-sm px-3 py-1"
                >
                  {stream.isWithdrawing ? 'Processing...' : 'Withdraw'}
                </Button>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div
                  className={`h-2 rounded-full ${stream.isActive ? 'bg-blue-500' : 'bg-gray-400'}`}
                  style={{ width: `${stream.percentComplete}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>{formatDate(stream.startTime)}</span>
                <span>
                  {stream.isActive
                    ? `${getRemainingDays(stream.endTime)} days remaining`
                    : formatDate(stream.endTime)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-gray-500">Withdrawn</p>
                  <p>{parseFloat(stream.withdrawnAmount).toFixed(4)} {stream.tokenSymbol}</p>
                </div>
                <div>
                  <p className="text-gray-500">Remaining</p>
                  <p>{parseFloat(stream.remainingAmount).toFixed(4)} {stream.tokenSymbol}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Streams Found</h3>
          <p className="text-gray-500 mb-4">
            {activeFilter !== 'all'
              ? `You don't have any ${activeFilter} streams.`
              : "You don't have any active streams yet."}
          </p>
          <div className="flex justify-center">
            <Link href="#" onClick={() => setActiveFilter('all')} className="text-blue-500 hover:text-blue-700 mr-4">
              View All Streams
            </Link>
            <Button
              className="text-sm"
              onClick={() => window.location.href = '/dashboard/staking'}
            >
              Create New Stream
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
