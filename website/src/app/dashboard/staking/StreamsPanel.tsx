'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContracts, useWatchContractEvent } from 'wagmi';
import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { useToast } from '@/hooks/useToast';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { ARBITRUM_CHAIN_ID } from '@/hooks/wagmi/useStaking';
import { formatEther } from 'viem';
import { SABLIER_LOCKUP_ABI } from '@/abis/SablierLockup';


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
  // Real-time data
  withdrawableAmount: string;
  ratePerSecond: string;
  lastUpdated: number;
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Data States
  const [streams, setStreams] = useState<Stream[]>([]);
  const [activeStreamIds, setActiveStreamIds] = useState<string[]>([]);

  // Check if user is on Arbitrum One
  const isArbitrumOne = chain?.id === ARBITRUM_CHAIN_ID;

  // Use this to store which streams are currently being withdrawn
  const [withdrawingStreams, setWithdrawingStreams] = useState<Record<string, boolean>>({});

  // Watch for contract withdrawal events to update streams data
  useWatchContractEvent({
    address: Config?.sablierLockupAddress,
    abi: SABLIER_LOCKUP_ABI,
    eventName: 'WithdrawFromLockupStream',
    onLogs: () => {
      console.log("WithdrawFromLockupStream event detected, refreshing data");
      handleRefresh();
    },
    enabled: isConnected && !!Config?.sablierLockupAddress,
  });

  // Prepare contracts for reading on-chain data for active streams
  const {
    data: streamContractData,
    isSuccess: isStreamDataSuccess,
    refetch: refetchStreamData
  } = useReadContracts({
    contracts: activeStreamIds.flatMap(streamId => [
      // Get withdrawable amount for each stream
      {
        address: Config?.sablierLockupAddress,
        abi: SABLIER_LOCKUP_ABI,
        functionName: 'withdrawableAmountOf',
        args: [BigInt(streamId.split('-')[0])],
        chainId: ARBITRUM_CHAIN_ID,
      },
      // Get deposited amount
      {
        address: Config?.sablierLockupAddress,
        abi: SABLIER_LOCKUP_ABI,
        functionName: 'getDepositedAmount',
        args: [BigInt(streamId.split('-')[0])],
        chainId: ARBITRUM_CHAIN_ID,
      },
      // Get withdrawn amount
      {
        address: Config?.sablierLockupAddress,
        abi: SABLIER_LOCKUP_ABI,
        functionName: 'getWithdrawnAmount',
        args: [BigInt(streamId.split('-')[0])],
        chainId: ARBITRUM_CHAIN_ID,
      },
      // Check if stream is cold
      {
        address: Config?.sablierLockupAddress,
        abi: SABLIER_LOCKUP_ABI,
        functionName: 'isCold',
        args: [BigInt(streamId.split('-')[0])],
        chainId: ARBITRUM_CHAIN_ID,
      }
    ]),
    allowFailure: true,
    query: {
      enabled: isConnected &&
               !!Config?.sablierLockupAddress &&
               isArbitrumOne &&
               activeStreamIds.length > 0,
      refetchInterval: 15000, // Refresh data every 15 seconds
    }
  });

  // Set up timer to update withdrawable amounts directly from contract
  useEffect(() => {
    // Don't set up timer if no active streams or not connected
    if (!isConnected || !Config?.sablierLockupAddress || activeStreamIds.length === 0 || !isArbitrumOne) {
      return;
    }

    // Function to fetch latest withdrawable amounts
    const updateWithdrawableAmounts = async () => {
      try {
        // Call refetchStreamData which will trigger the withdrawableAmountOf calls
        await refetchStreamData();
      } catch (error) {
        console.error("Error updating withdrawable amounts:", error);
      }
    };

    // Initial call
    updateWithdrawableAmounts();
    
    // Set up interval for periodic updates
    const interval = setInterval(updateWithdrawableAmounts, 15000); // Every 15 seconds
    
    return () => clearInterval(interval);
  }, [isConnected, Config?.sablierLockupAddress, activeStreamIds, isArbitrumOne, refetchStreamData]);

  // Process contract data into a format we can use
  const processContractData = useCallback(() => {
    if (!streamContractData || activeStreamIds.length === 0) return {};

    const processedData: Record<string, {
      withdrawableAmount: bigint;
      depositedAmount: bigint;
      withdrawnAmount: bigint;
      isCold: boolean;
    }> = {};

    for (let i = 0; i < activeStreamIds.length; i++) {
      const streamId = activeStreamIds[i];
      const baseIdx = i * 4; // Each stream has 4 contract calls

      // Get withdrawable amount
      const withdrawableAmount = streamContractData[baseIdx]?.result;
      // Get deposited amount
      const depositedAmount = streamContractData[baseIdx + 1]?.result;
      // Get withdrawn amount
      const withdrawnAmount = streamContractData[baseIdx + 2]?.result;
      // Check if stream is cold
      const isCold = streamContractData[baseIdx + 3]?.result;

      if (withdrawableAmount !== undefined && typeof withdrawableAmount === 'bigint' &&
          depositedAmount !== undefined && typeof depositedAmount === 'bigint' &&
          withdrawnAmount !== undefined && typeof withdrawnAmount === 'bigint' &&
          isCold !== undefined && typeof isCold === 'boolean') {

        processedData[streamId] = {
          withdrawableAmount,
          depositedAmount,
          withdrawnAmount,
          isCold
        };
      }
    }

    return processedData;
  }, [streamContractData, activeStreamIds]);

  // Calculate rate per second based on stream data
  const calculateRatePerSecond = useCallback((startTimeMs: number, endTimeMs: number, totalAmount: string): string => {
    const now = Date.now();
    const totalDuration = Math.max(endTimeMs - startTimeMs, 1); // Avoid division by zero
    const remainingDuration = Math.max(endTimeMs - now, 0);

    if (remainingDuration <= 0) return '0'; // Stream completed

    const totalTokens = parseFloat(totalAmount);
    const ratePerMs = totalTokens / totalDuration;
    const ratePerSecond = ratePerMs * 1000; // Convert to per second

    return ratePerSecond.toString();
  }, []);

  // Update streams with on-chain data
  useEffect(() => {
    if (!isStreamDataSuccess || !streamContractData) return;

    const onChainData = processContractData();

    if (Object.keys(onChainData).length === 0) return;

    setStreams(prevStreams =>
      prevStreams.map(stream => {
        const data = onChainData[stream.id];
        if (!data) return stream;

        const withdrawableAmount = formatEther(data.withdrawableAmount);
        const depositedAmount = formatEther(data.depositedAmount);
        const withdrawnAmount = formatEther(data.withdrawnAmount);
        const isActive = !data.isCold;

        // Calculate rate per second (tokens streaming per second)
        const ratePerSecond = calculateRatePerSecond(
          stream.startTime.getTime(),
          stream.endTime.getTime(),
          depositedAmount
        );

        return {
          ...stream,
          withdrawableAmount,
          deposit: depositedAmount,
          withdrawnAmount,
          ratePerSecond,
          isActive,
          lastUpdated: Date.now()
        };
      })
    );
  }, [isStreamDataSuccess, streamContractData, processContractData, calculateRatePerSecond]);

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

          // Determine if stream is active (will be updated with contract data)
          const isActive = !graphStream.canceled && now < endTime;

          // Calculate rate per second
          const ratePerSecond = calculateRatePerSecond(
            startTime.getTime(),
            endTime.getTime(),
            deposit
          );

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
            isWithdrawing: withdrawingStreams[graphStream.id] || false,
            // We'll get the actual value from the contract soon
            withdrawableAmount: '0',
            ratePerSecond,
            lastUpdated: Date.now()
          };
        });

        setStreams(processedStreams);

        // Extract active stream IDs for contract data fetching
        const newActiveStreamIds = processedStreams
          .filter(stream => stream.isActive)
          .map(stream => stream.id);

        setActiveStreamIds(newActiveStreamIds);
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
  }, [address, isConnected, refreshTrigger, Config]);

  // Reset loading state and show error when error occurs
  useEffect(() => {
    if (error) {
      showError("An error occurred with your stream operation. Please try again.");

      // Reset withdrawing state
      setWithdrawingStreams({});
    }
  }, [error, showError]);

  // Handle refresh after confirmed transaction
  useEffect(() => {
    if (isConfirmed) {
      showSuccess("Stream operation completed successfully");

      // Reset withdrawing state
      setWithdrawingStreams({});

      // Create a small delay before refreshing to avoid race conditions
      const timer = setTimeout(() => {
        handleRefresh();
      }, 1000);

      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  // Handle withdraw from stream
  const handleWithdraw = async (streamId: string) => {
    if (!isConnected || !Config?.sablierLockupAddress || !isArbitrumOne) return;

    // Update withdrawing state
    setWithdrawingStreams(prev => ({
      ...prev,
      [streamId]: true
    }));

    try {
      await writeContractWithNotifications({
        address: Config.sablierLockupAddress,
        abi: SABLIER_LOCKUP_ABI,
        functionName: 'withdrawMax',
        args: [BigInt(streamId.split('-')[0])],
        contracts: {
          sablierLockupAddress: Config.sablierLockupAddress,
        },
        successMessage: 'Successfully withdrew from stream!',
        customErrorMessages: {
          userDenied: 'Withdrawal was denied by the user',
          default: 'Failed to withdraw from stream'
        }
      });
    } catch (error) {
      Sentry.captureException(error);
      showError(`Error withdrawing from stream #${streamId}. Please try again.`);
      console.error("Error withdrawing from stream:", error);

      // Reset withdrawing state
      setWithdrawingStreams(prev => ({
        ...prev,
        [streamId]: false
      }));
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    refetchStreamData();
  };

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

  // Format number with commas for thousands
  const formatNumber = (value: string, decimals = 4) => {
    const num = parseFloat(value);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Calculate tokens per day
  const getTokensPerDay = (ratePerSecond: string) => {
    const rate = parseFloat(ratePerSecond);
    const tokensPerDay = rate * 60 * 60 * 24;
    return tokensPerDay.toFixed(4);
  };

  // Filter streams based on active filter
  const filteredStreams = streams.filter(stream => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return stream.isActive;
    if (activeFilter === 'completed') return !stream.isActive;
    return true;
  });

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
                      {formatNumber(stream.deposit)} {stream.tokenSymbol}
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
                    parseFloat(stream.withdrawableAmount) <= 0 ||
                    stream.isWithdrawing ||
                    isConfirming ||
                    withdrawingStreams[stream.id]
                  }
                  className="text-sm px-3 py-1"
                >
                  {stream.isWithdrawing || withdrawingStreams[stream.id] ? 'Processing...' : 'Withdraw'}
                </Button>
              </div>

              {/* Progress bar with animation */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${stream.isActive ? 'bg-blue-500' : 'bg-gray-400'} ${
                    stream.isActive && parseFloat(stream.ratePerSecond) > 0 ? 'animate-pulse' : ''
                  }`}
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

              {/* Real-time withdrawable tokens with animation */}
              {stream.isActive && parseFloat(stream.ratePerSecond) > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4 relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Available to Claim</p>
                      <p className="text-xl font-bold text-blue-900">
                        {formatNumber(stream.withdrawableAmount)} {stream.tokenSymbol}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-600">Streaming Rate</p>
                      <p className="text-sm font-medium text-blue-800">
                        {formatNumber(stream.ratePerSecond, 8)} {stream.tokenSymbol}/sec
                      </p>
                      <p className="text-xs text-blue-600">
                        {getTokensPerDay(stream.ratePerSecond)} {stream.tokenSymbol}/day
                      </p>
                    </div>
                  </div>
                  {/* Animation for streaming tokens */}
                  <div className="absolute bottom-0 left-0 h-1 bg-blue-300 opacity-50 animate-stream"></div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-gray-500">Withdrawn</p>
                  <p>{formatNumber(stream.withdrawnAmount)} {stream.tokenSymbol}</p>
                </div>
                <div>
                  <p className="text-gray-500">Remaining</p>
                  <p>{formatNumber(stream.remainingAmount)} {stream.tokenSymbol}</p>
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

      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes stream {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-stream {
          animation: stream 2s infinite linear;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
