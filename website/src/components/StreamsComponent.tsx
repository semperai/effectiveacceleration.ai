'use client';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { Button } from '@/components/Button';
import Image from 'next/image';
import { useConfig } from '@/hooks/useConfig';
import { formatEther } from 'viem';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { useToast } from '@/hooks/useToast';
import * as Sentry from '@sentry/nextjs';

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
  startTime: Date;
  endTime: Date;
  lockupAmount: string;
  withdrawnAmount: string;
  remainingAmount: string;
  percentComplete: number;
  isActive: boolean;
  isWithdrawing?: boolean; // Track individual stream withdrawal status
}

export default function StreamsComponent() {
  const { address, isConnected } = useAccount();
  const Config = useConfig();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [streamIds, setStreamIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { writeContractWithNotifications, isConfirming, isConfirmed, error } = useWriteContractWithNotifications();
  const { showError, showSuccess } = useToast();

  // In a real implementation, you'd fetch streamIds from a backend or indexer
  // For demonstration, we'll use example IDs
  useEffect(() => {
    if (isConnected && address) {
      // Example: In production, you would get these from an indexer or API
      setStreamIds(['1', '2', '3']);
    }
  }, [isConnected, address]);

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
      setIsLoading(false);
      // Reset any individual stream loading states
      setStreams(prevStreams =>
        prevStreams.map(stream => ({
          ...stream,
          isWithdrawing: false
        }))
      );
    }
  }, [error]);

  // Refresh streams after a successful withdraw
  useEffect(() => {
    if (isConfirmed) {
      refetch();
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

          // Preserve isWithdrawing state if it exists
          const existingStream = streams.find(s => s.id === streamIds[index]);

          return {
            id: streamIds[index],
            deposit: formatEther(streamData[3]), // deposit is at index 3
            token: streamData[4], // token is at index 4
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
  }, [streamsData, streamIds, streams]);

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

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Streams</h2>
        <Button
          onClick={handleRefresh}
          disabled={isLoadingStreams || isConfirming}
          className="text-sm px-4"
        >
          {isLoadingStreams ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {isLoadingStreams ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : streams.length > 0 ? (
        <div className="space-y-4">
          {streams.map((stream) => (
            <div key={stream.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold mr-2">{stream.deposit} EACC</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${stream.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
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
                  {stream.isWithdrawing || (isConfirming && streams.find(s => s.isWithdrawing && s.id === stream.id))
                    ? 'Processing...'
                    : 'Withdraw'}
                </Button>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${stream.percentComplete}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p>{formatDate(stream.startTime)}</p>
                </div>
                <div>
                  <p className="text-gray-500">End Date</p>
                  <p>{formatDate(stream.endTime)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Withdrawn</p>
                  <p>{parseFloat(stream.withdrawnAmount).toFixed(4)} EACC</p>
                </div>
                <div>
                  <p className="text-gray-500">Remaining</p>
                  <p>{parseFloat(stream.remainingAmount).toFixed(4)} EACC</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="flex justify-center mb-4">
            <Image
              src="/placeholder-icon.svg" // Replace with your actual placeholder image
              alt="No streams"
              width={64}
              height={64}
              className="opacity-30"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Streams Found</h3>
          <p className="text-gray-500 mb-4">You don't have any active streams yet.</p>
          <Button
            onClick={() => window.location.href = '/finance'}
            className="text-sm"
          >
            Create Your First Stream
          </Button>
        </div>
      )}
    </div>
  );
}