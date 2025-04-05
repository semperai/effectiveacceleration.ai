'use client';
import { useState, useEffect } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { useToast } from '@/hooks/useToast';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { ARBITRUM_CHAIN_ID } from '@/hooks/wagmi/useStaking';

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

// Mock data for streams - to avoid network calls during testing
const MOCK_STREAMS: Stream[] = [
  {
    id: "1",
    deposit: "1000.0",
    token: "0x1234...",
    tokenSymbol: "EACC",
    startTime: new Date("2023-01-01"),
    endTime: new Date("2025-01-01"),
    lockupAmount: "1000.0",
    withdrawnAmount: "250.0",
    remainingAmount: "750.0",
    percentComplete: 25,
    isActive: true,
    isWithdrawing: false
  },
  {
    id: "2",
    deposit: "500.0",
    token: "0x5678...",
    tokenSymbol: "EAXX",
    startTime: new Date("2023-06-01"),
    endTime: new Date("2024-06-01"),
    lockupAmount: "500.0",
    withdrawnAmount: "375.0",
    remainingAmount: "125.0",
    percentComplete: 75,
    isActive: true,
    isWithdrawing: false
  },
  {
    id: "3",
    deposit: "200.0",
    token: "0x1234...",
    tokenSymbol: "EACC",
    startTime: new Date("2022-01-01"),
    endTime: new Date("2023-01-01"),
    lockupAmount: "200.0",
    withdrawnAmount: "200.0",
    remainingAmount: "0.0",
    percentComplete: 100,
    isActive: false,
    isWithdrawing: false
  }
];

export function StreamsPanel() {
  const { address, isConnected, chain } = useAccount();
  const Config = useConfig();
  const { writeContractWithNotifications, isConfirming, isConfirmed, error } = useWriteContractWithNotifications();
  const { showError, showSuccess } = useToast();

  // UI States
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [streams, setStreams] = useState<Stream[]>([]);

  // Check if user is on Arbitrum One
  const isArbitrumOne = chain?.id === ARBITRUM_CHAIN_ID;

  // Initial data load (simulating API call)
  useEffect(() => {
    const timer = setTimeout(() => {
      setStreams(MOCK_STREAMS);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
    }
  }, [isConfirmed, showSuccess]);

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

    // Simulate refresh with a timeout
    setTimeout(() => {
      setStreams(MOCK_STREAMS);
      setIsLoading(false);
    }, 500);
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
