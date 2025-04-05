'use client';
import { useState, useEffect } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { Button } from '@/components/Button';
import Image from 'next/image';
import { useConfig } from '@/hooks/useConfig';
import { formatEther } from 'viem';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { useToast } from '@/hooks/useToast';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';

// Sablier Lockup ABI
const SABLIER_LOCKUP_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }],
    name: 'streamById',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint128', name: 'deposit', type: 'uint128' },
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'uint40', name: 'startTime', type: 'uint40' },
          { internalType: 'uint40', name: 'endTime', type: 'uint40' },
          { internalType: 'uint128', name: 'lockupAmount', type: 'uint128' },
          { internalType: 'uint128', name: 'withdrawnAmount', type: 'uint128' },
          { internalType: 'bool', name: 'isCancelable', type: 'bool' },
          { internalType: 'bool', name: 'wasCanceled', type: 'bool' }
        ],
        internalType: 'struct Stream',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }],
    name: 'withdrawMax',
    outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }, { internalType: 'uint128', name: 'amount', type: 'uint128' }],
    name: 'withdrawAmount',
    outputs: [{ internalType: 'uint256', name: 'withdrawnAmount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

// Interface representing processed stream data
interface Stream {
  id: string;
  deposit: string;
  token: string;
  tokenSymbol: string; // Added to support multiple tokens
  startTime: Date;
  endTime: Date;
  lockupAmount: string;
  withdrawnAmount: string;
  remainingAmount: string;
  percentComplete: number;
  isActive: boolean;
  isWithdrawing?: boolean;
}

export function StreamsPanel() {
  const { address, isConnected } = useAccount();
  const Config = useConfig();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [streamIds, setStreamIds] = useState<string[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const { writeContractWithNotifications, isConfirming, isConfirmed, error } = useWriteContractWithNotifications();
  const { showError, showSuccess } = useToast();
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Helper function to determine token symbol from address
  const getTokenSymbol = (tokenAddress: string): string => {
    if (!Config) return 'TOKEN';

    // Compare with known token addresses from config
    if (tokenAddress.toLowerCase() === Config.EACCAddress?.toLowerCase()) return 'EACC';
    if (tokenAddress.toLowerCase() === Config.EACCBarAddress?.toLowerCase()) return 'EAXX';

    // Default fallback
    return 'TOKEN';
  };

  // In a real implementation, you'd fetch streamIds from a backend or indexer
  useEffect(() => {
    const fetchStreamIds = async () => {
      if (isConnected && address && Config?.sablierLockupAddress) {
        try {
          setIsLoadingInitial(true);
          // In a real implementation, you would fetch this from an API or subgraph
          // Example: const response = await fetch(`/api/streams?address=${address}`);
          // For demonstration, we'll use example IDs

          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));

          // Example IDs - In production, these would come from your backend/indexer
          setStreamIds(['1', '2', '3']);
        } catch (error) {
          console.error("Error fetching stream IDs:", error);
          Sentry.captureException(error);
          showError("Failed to load your streams. Please try again later.");
        } finally {
          setIsLoadingInitial(false);
        }
      }
    };

    fetchStreamIds();
  }, [isConnected, address, Config?.sablierLockupAddress, showError]);

  // Read multiple streams data at once using useReadContracts
  const { data: streamsData, isLoading: isLoadingStreams, refetch } = useReadContracts({
    contracts: streamIds.map(id => ({
      abi: SABLIER_LOCKUP_ABI,
      address: Config?.sablierLockupAddress,
      functionName: 'streamById',
      args: [BigInt(id)],
    })),
    multicallAddress: Config?.multicall3Address,
    query: {
      enabled: isConnected && !!address && streamIds.length > 0 && !!Config?.sablierLockupAddress,
    }
  });

  // Reset loading state when error occurs
  useEffect(() => {
    if (error) {
      // Reset any individual stream loading states
      setStreams(prevStreams =>
        prevStreams.map(stream => ({
          ...stream,
          isWithdrawing: false
        }))
      );

      showError("An error occurred with your stream operation. Please try again.");
    }
  }, [error, showError]);

  // Refresh streams after a successful withdraw
  useEffect(() => {
    if (isConfirmed) {
      refetch();
      // Reset withdrawing state for all streams
      setStreams(prevStreams =>
        prevStreams.map(stream => ({
          ...stream,
          isWithdrawing: false
        }))
      );
    }
  }, [isConfirmed, refetch]);

  // Process streams data when it changes
  useEffect(() => {
    if (streamsData && streamsData.length > 0) {
      const processedStreams = streamsData
        .filter(data => data.status === 'success' && data.result)
        .map((data, index) => {
          const streamData = data.result as any;
          if (!streamData) return null;

          const now = new Date();
          const startTime = new Date(Number(streamData[5]) * 1000); // startTime is at index 5
          const endTime = new Date(Number(streamData[6]) * 1000); // endTime is at index 6

          // Calculate percentage complete
          const totalTime = Number(streamData[6]) - Number(streamData[5]);
          const elapsedTime = Math.min(
            Math.max(Math.floor(now.getTime() / 1000) - Number(streamData[5]), 0),
            totalTime
          );
          const percentComplete = totalTime > 0 ? (elapsedTime / totalTime) * 100 : 0;

          // Calculate remaining amount
          const lockupAmount = streamData[7]; // lockupAmount is at index 7
          const withdrawnAmount = streamData[8]; // withdrawnAmount is at index 8
          const remainingAmount = BigInt(lockupAmount) - BigInt(withdrawnAmount);

          // Check if stream is active
          const isActive = now >= startTime && now <= endTime && !streamData[10]; // wasCanceled is at index 10

          // Get token symbol
          const tokenSymbol = getTokenSymbol(streamData[4]); // token is at index 4

          // Preserve isWithdrawing state if it exists
          const existingStream = streams.find(s => s.id === streamIds[index]);

          return {
            id: streamIds[index],
            deposit: formatEther(streamData[3]), // deposit is at index 3
            token: streamData[4], // token is at index 4
            tokenSymbol: tokenSymbol,
            startTime: startTime,
            endTime: endTime,
            lockupAmount: formatEther(lockupAmount),
            withdrawnAmount: formatEther(withdrawnAmount),
            remainingAmount: formatEther(remainingAmount),
            percentComplete: percentComplete,
            isActive: isActive,
            isWithdrawing: existingStream?.isWithdrawing || false
          };
        })
        .filter(stream => stream !== null) as Stream[];

      setStreams(processedStreams);
    }
  }, [streamsData, streamIds, streams, Config]);

  // Filter streams based on active filter
  const filteredStreams = streams.filter(stream => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return stream.isActive;
    if (activeFilter === 'completed') return !stream.isActive;
    return true;
  });

  // Handle withdraw from stream
  const handleWithdraw = async (streamId: string) => {
    if (!isConnected || !Config?.sablierLockupAddress) return;

    // Set loading state for specific stream
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

      if (isConfirmed) {
        showSuccess(`Successfully withdrawn from stream #${streamId}`);
      }
    } catch (error) {
      Sentry.captureException(error);
      showError(`Error withdrawing from stream #${streamId}. Please try again.`);
      console.error("Error withdrawing from stream:", error);

      // Reset loading state for the specific stream
      setStreams(prevStreams =>
        prevStreams.map(stream =>
          stream.id === streamId ? { ...stream, isWithdrawing: false } : stream
        )
      );
    }
  };

  // Format date to readable string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle refresh of streams data
  const handleRefresh = () => {
    refetch();
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
            disabled={isLoadingStreams || isConfirming}
            className="text-sm px-3"
          >
            {isLoadingStreams ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {isLoadingInitial || isLoadingStreams ? (
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
