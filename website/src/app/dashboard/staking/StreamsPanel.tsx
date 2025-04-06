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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCcw, ExternalLink } from 'lucide-react';
import { StreamCard } from './StreamCard';

// Interface representing processed stream data
interface Stream {
  id: string;
  tokenId: string;
  token: string;
  tokenSymbol: string;
  startTime: Date;
  endTime: Date;
  percentComplete: number;
  isActive: boolean;
  isWithdrawing: boolean;
  // Real-time data
  withdrawableAmount: string;
  lastUpdated: number;
}

// GraphQL Types - Optimized to include only what we need
interface GraphQLStream {
  id: string;
  tokenId: string;
  endTime: string; // Unix timestamp
  startTime: string; // Unix timestamp
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
  const [pageSize, setPageSize] = useState(6); // For better grid layout
  const [totalCount, setTotalCount] = useState(0);

  // Data States
  const [streams, setStreams] = useState<Stream[]>([]);
  const [activeTokenIds, setActiveTokenIds] = useState<string[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Check if user is on Arbitrum One
  const isArbitrumOne = chain?.id === ARBITRUM_CHAIN_ID;

  // Sablier dashboard URL
  const sablierDashboardUrl = `https://app.sablier.com/vesting/?t=search&c=42161&r=${address}`;

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

  // Simplified contract data fetching - only get withdrawable amounts for active streams
  const {
    data: streamContractData,
    isSuccess: isStreamDataSuccess,
    refetch: refetchStreamData
  } = useReadContracts({
    contracts: activeTokenIds.map(tokenId => ({
      address: Config?.sablierLockupAddress,
      abi: SABLIER_LOCKUP_ABI,
      functionName: 'withdrawableAmountOf',
      args: [tokenId],
      chainId: ARBITRUM_CHAIN_ID,
    })),
    allowFailure: true,
    query: {
      enabled: isConnected &&
               !!Config?.sablierLockupAddress &&
               isArbitrumOne &&
               activeTokenIds.length > 0,
      refetchInterval: 15000, // Refresh data every 15 seconds
    }
  });

  // Set up timer to update withdrawable amounts directly from contract
  useEffect(() => {
    // Don't set up timer if no active streams or not connected
    if (!isConnected ||
        !Config?.sablierLockupAddress ||
        activeTokenIds.length === 0 ||
        !isArbitrumOne) {
      return;
    }

    // Function to fetch latest withdrawable amounts
    const updateWithdrawableAmounts = async () => {
      try {
        await refetchStreamData();
      } catch (error) {
        console.error("Error updating withdrawable amounts:", error);
      }
    };

    // Initial call
    updateWithdrawableAmounts();

    // Set up interval for periodic updates
    // Dynamic interval based on number of active streams
    // Fewer active streams = more frequent updates
    // More active streams = less frequent updates to reduce network load
    const updateInterval = Math.min(
      Math.max(10000, activeTokenIds.length * 2000), // Between 10s and scaled by number of streams
      30000 // But never more than 30s
    );

    const interval = setInterval(updateWithdrawableAmounts, updateInterval);

    // Clear interval on unmount or when dependencies change
    return () => clearInterval(interval);
  }, [isConnected, Config?.sablierLockupAddress, activeTokenIds, isArbitrumOne, refetchStreamData]);

  // Process contract data into a format we can use - simplified to just handle withdrawable amounts
  const processContractData = useCallback(() => {
    if (!streamContractData || activeTokenIds.length === 0) return {};

    const processedData: Record<string, {
      withdrawableAmount: bigint;
    }> = {};

    // Process in batches to avoid excessive loop iterations for large datasets
    for (let i = 0; i < activeTokenIds.length; i++) {
      const tokenId = activeTokenIds[i];
      const withdrawableAmount = streamContractData[i]?.result;

      if (withdrawableAmount !== undefined && typeof withdrawableAmount === 'bigint') {
        processedData[tokenId] = {
          withdrawableAmount
        };
      }
    }

    return processedData;
  }, [streamContractData, activeTokenIds]);

  // Update streams with on-chain data
  useEffect(() => {
    if (!isStreamDataSuccess || !streamContractData) return;

    const onChainData = processContractData();

    if (Object.keys(onChainData).length === 0) return;

    setStreams(prevStreams =>
      prevStreams.map(stream => {
        const data = onChainData[stream.tokenId];
        if (!data) return stream;

        const withdrawableAmount = formatEther(data.withdrawableAmount);

        return {
          ...stream,
          withdrawableAmount,
          lastUpdated: Date.now()
        };
      })
    );
  }, [isStreamDataSuccess, streamContractData, processContractData]);

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
              endTime
              startTime
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
        const minimumTotalCount = (currentPage - 1) * pageSize + graphqlStreams.length;
        const estimatedTotalCount = hasMorePages ? minimumTotalCount + 1 : minimumTotalCount;
        setTotalCount(prevCount => Math.max(prevCount, estimatedTotalCount));

        // Map GraphQL data to our Stream interface
        const now = new Date();

        const processedStreams: Stream[] = graphqlStreams.map(graphStream => {
          const startTime = new Date(parseInt(graphStream.startTime) * 1000);
          const endTime = new Date(parseInt(graphStream.endTime) * 1000);

          // Calculate percent complete
          const totalDuration = endTime.getTime() - startTime.getTime();
          const elapsedDuration = Math.min(now.getTime() - startTime.getTime(), totalDuration);
          const percentComplete = Math.floor((elapsedDuration / totalDuration) * 100);

          // Determine if stream is active based ONLY on time
          const isActive = now < endTime;

          return {
            id: graphStream.id,
            tokenId: graphStream.tokenId,
            token: Config?.EACCAddress || '',
            tokenSymbol: 'EACC',
            startTime,
            endTime,
            percentComplete,
            isActive,
            isWithdrawing: withdrawingStreams[graphStream.id] || false,
            // We'll get the actual value from the contract soon
            withdrawableAmount: '0',
            lastUpdated: Date.now()
          };
        });

        setStreams(processedStreams);

        // Mark initial load as complete
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }

        // Extract active token IDs for contract data fetching - only truly active streams
        const newActiveTokenIds = processedStreams
          .filter(stream => stream.isActive)
          .map(stream => stream.tokenId);

        setActiveTokenIds(newActiveTokenIds);
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
  }, [address, isConnected, refreshTrigger, Config, currentPage, pageSize, activeFilter]);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Reset loading state and show error when error occurs
  useEffect(() => {
    if (error) {
      showError("An error occurred with your stream operation. Please try again.");
      setWithdrawingStreams({});
    }
  }, [error, showError]);

  // Handle refresh after confirmed transaction
  useEffect(() => {
    if (isConfirmed) {
      showSuccess("Stream operation completed successfully");
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
  const handleWithdraw = async (streamId: string, tokenId: string) => {
    if (!isConnected || !Config?.sablierLockupAddress || !isArbitrumOne) return;

    // Update withdrawing state
    setWithdrawingStreams(prev => ({
      ...prev,
      [streamId]: true
    }));

    try {
      console.log('Withdraw max from stream:', tokenId, address);
      await writeContractWithNotifications({
        address: Config.sablierLockupAddress,
        abi: SABLIER_LOCKUP_ABI,
        functionName: 'withdrawMax',
        args: [tokenId, address],
        value: BigInt(0),
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          {/* Header section with title, filters, and actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Streams</h2>
              <Link
                href={sablierDashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                Sablier Dashboard <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-gray-100 rounded-md p-1 text-sm">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-1.5 rounded-md transition-colors ${activeFilter === 'all'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('active')}
                  className={`px-4 py-1.5 rounded-md transition-colors ${activeFilter === 'active'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveFilter('completed')}
                  className={`px-4 py-1.5 rounded-md transition-colors ${activeFilter === 'completed'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  Completed
                </button>
              </div>

              <Button
                onClick={handleRefresh}
                disabled={isLoading || isConfirming}
                className={`flex items-center px-4 py-2 text-sm rounded-md shadow-sm transition-colors ${
                  isLoading || isConfirming
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <RefreshCcw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Updating...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Instruction text for clickable cards */}
          {filteredStreams.length > 0 && filteredStreams.some(stream =>
            stream.isActive && parseFloat(stream.withdrawableAmount) > 0) && (
            <div className="text-sm text-gray-500 mt-2 mb-2">
              Click on any active card to withdraw available tokens.
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="p-6">
          {(!initialLoadComplete || (isLoading && !filteredStreams.length)) ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading your streams...</p>
            </div>
          ) : filteredStreams.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStreams.map((stream) => (
                  <StreamCard
                    key={stream.id}
                    stream={stream}
                    onWithdraw={handleWithdraw}
                    isConfirming={isConfirming}
                    withdrawingStreams={withdrawingStreams}
                  />
                ))}
              </div>

              {/* Pagination component */}
              {totalCount > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                      Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} streams
                    </div>

                    <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                        className={`inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">First</span>
                      </button>

                      <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className={`inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
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
                        className={`inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!hasMorePages && currentPage >= totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Next</span>
                      </button>

                      {/* Only show Last Page button if we have a good idea of the total pages */}
                      {totalPages > 2 && (
                        <button
                          onClick={goToLastPage}
                          disabled={!hasMorePages && currentPage >= totalPages}
                          className={`inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!hasMorePages && currentPage >= totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
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
            <div className="text-center py-16 rounded-lg bg-gray-50">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">No Streams Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {activeFilter !== 'all'
                  ? `You don't have any ${activeFilter} streams at the moment.`
                  : "You don't have any streams yet."}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {activeFilter !== 'all' && (
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-md border border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                  >
                    View All Streams
                  </button>
                )}
                <Link href="/dashboard/staking">
                  <Button
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md"
                  >
                    Create New Stream
                  </Button>
                </Link>
                <Link
                  href={sablierDashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Go to Sablier Dashboard <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

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
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
