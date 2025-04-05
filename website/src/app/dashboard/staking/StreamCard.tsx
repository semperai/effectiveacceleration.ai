'use client';
import { Button } from '@/components/Button';

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

interface StreamCardProps {
  stream: Stream;
  onWithdraw: (streamId: string) => void;
  isConfirming: boolean;
  withdrawingStreams: Record<string, boolean>;
}

/**
 * StreamCard component to display individual stream information
 */
export function StreamCard({ stream, onWithdraw, isConfirming, withdrawingStreams = {} }: StreamCardProps) {
  // Format date to readable string
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate remaining time in days
  const getRemainingDays = (endTime: Date): number => {
    const now = new Date();
    const diffTime = endTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Format number with commas for thousands
  const formatNumber = (value: string, decimals = 4): string => {
    const num = parseFloat(value);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Calculate tokens per day
  const getTokensPerDay = (ratePerSecond: string): string => {
    const rate = parseFloat(ratePerSecond);
    const tokensPerDay = rate * 60 * 60 * 24;
    return tokensPerDay.toFixed(4);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
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
          onClick={() => onWithdraw(stream.id)}
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
  );
}

