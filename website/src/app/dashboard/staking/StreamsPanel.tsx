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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { StreamCard } from './StreamCard';

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

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

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

  // Fetch streams data from GraphQL with pagination
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
        const offset = (currentPage - 1) * pageSize;

        // Construct the GraphQL query with pagination
        // We'll fetch one extra item to determine if there are more pages
        const fetchLimit = pageSize + 1;

        const query = `
          query FetchStreams {
            Stream(
              where: {
                chainId: {_eq: "42161"},
                recipient: {_eq: "${userAddress}"},
                asset_id: {_eq: "${tokenAddress}"}
              }
              limit: ${fetchLimit}
              offset: ${offset}
              order_by: {endTime: desc}
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
        let graphqlStreams: GraphQLStream[] = result.data.Stream || [];

        // Check if we have more pages by seeing if we got more items than requested
        const hasMorePages = graphqlStreams.length > pageSize;

        // Trim the extra item if we fetched more than page size
        if (hasMorePages) {
          graphqlStreams = graphqlStreams.slice(0, pageSize);
        }

        // Update our knowledge about pagination
        // If we're on page 1, total count is at least the number of streams we got
        // If we're beyond page 1, total count is at least (currentPage-1)*pageSize + current batch size
        const minimumTotalCount = (currentPage - 1) * pageSize + graphqlStreams.length;

        // If we know there are more pages, add 1 to ensure "Next" button works
        const estimatedTotalCount = hasMorePages ? minimumTotalCount + 1 : minimumTotalCount;

        // Only update total count if our new estimate is higher than what we already have
        // This prevents the count from going down when moving to later pages
        setTotalCount(prevCount => Math.max(prevCount, estimatedTotalCount));

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected, refreshTrigger, Config, currentPage, pageSize, activeFilter, calculateRatePerSecond]);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

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

  // Filter streams based on active filter
  const filteredStreams = streams.filter(stream => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return stream.isActive;
    if (activeFilter === 'completed') return !stream.isActive;
    return true;
  });

  // Calculate if there are more pages
  const hasMorePages = filteredStreams.length === pageSize && currentPage * pageSize < totalCount;

  // Calculate total pages based on our best estimate
  const totalPages = Math.max(currentPage, Math.ceil(totalCount / pageSize));

  // Simplified pagination for when we don't have exact page count
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // If we're in the first few pages, show pages 1 through maxVisiblePages
    if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
      for (let i = 1; i <= Math.min(maxVisiblePages, totalPages); i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (totalPages > maxVisiblePages) {
        pages.push('...');
        // Only add last page if we're certain it exists
        if (totalPages > currentPage + 2) {
          pages.push(totalPages);
        }
      }
    }
    // If we're near the end (if we know it)
    else if (totalPages - currentPage < Math.floor(maxVisiblePages / 2)) {
      // Add first page and ellipsis
      pages.push(1);
      pages.push('...');

      // Show last few pages
      for (let i = Math.max(1, totalPages - maxVisiblePages + 2); i <= totalPages; i++) {
        pages.push(i);
      }
    }
    // If we're in the middle
    else {
      // Add first page and ellipsis
      pages.push(1);
      pages.push('...');

      // Show current page and one on each side
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      // Add ellipsis and last page if needed
      if (currentPage + 1 < totalPages) {
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPage = (page: number) => setCurrentPage(page);

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
            <StreamCard
              key={stream.id}
              stream={stream}
              onWithdraw={handleWithdraw}
              isConfirming={isConfirming}
              withdrawingStreams={withdrawingStreams}
            />
          ))}

          {/* Pagination component */}
          {totalCount > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to {Math.min(currentPage * pageSize, totalCount)} streams
                </div>

                <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">First</span>
                  </button>

                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Previous</span>
                  </button>

                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="inline-flex items-center px-4 py-2 text-sm text-gray-700 ring-1 ring-inset ring-gray-300"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        onClick={() => goToPage(page as number)}
                        className={`inline-flex items-center px-4 py-2 text-sm ${
                          currentPage === page
                            ? 'bg-blue-500 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}

                  <button
                    onClick={goToNextPage}
                    disabled={!hasMorePages && currentPage >= totalPages}
                    className={`inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!hasMorePages && currentPage >= totalPages ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Next</span>
                  </button>

                  {/* Only show Last Page button if we have a good idea of the total pages */}
                  {totalPages > 2 && (
                    <button
                      onClick={goToLastPage}
                      disabled={!hasMorePages && currentPage >= totalPages}
                      className={`inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!hasMorePages && currentPage >= totalPages ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <ChevronsRight className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Last</span>
                    </button>
                  )}
                </nav>
              </div>
            </div>
          )}
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
