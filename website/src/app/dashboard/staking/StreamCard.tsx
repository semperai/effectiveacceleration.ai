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

  // Determine background gradient based on stream status
  const getCardGradient = () => {
    if (!stream.isActive) {
      return 'bg-gradient-to-br from-gray-50 to-gray-100';
    }
    return 'bg-gradient-to-br from-blue-50 to-indigo-50';
  };

  // Determine progress bar gradient
  const getProgressGradient = () => {
    if (!stream.isActive) {
      return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
    return 'bg-gradient-to-r from-blue-500 to-indigo-600';
  };

  // Calculate percentages for display
  const completionPercentText = `${Math.min(100, Math.round(stream.percentComplete))}%`;

  // Is the stream currently processing a withdrawal?
  const isProcessing = stream.isWithdrawing || withdrawingStreams[stream.id];

  return (
    <div className={`${getCardGradient()} rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`}>
      {/* Top status bar with badge */}
      <div className="relative h-1.5 w-full bg-gray-200 overflow-hidden">
        <div 
          className={`h-full ${getProgressGradient()} ${stream.isActive ? 'animate-pulse-slow' : ''}`}
          style={{ width: `${stream.percentComplete}%` }}
        ></div>
      </div>
      
      <div className="p-5">
        {/* Withdrawable amount section with pulsing animation */}
        {stream.isActive && parseFloat(stream.ratePerSecond) > 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 rounded-xl mb-5 text-white relative overflow-hidden shadow-md">
            {/* Animated particle background */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white opacity-10"
                  style={{
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${Math.random() * 10 + 10}s linear infinite`
                  }}
                />
              ))}
            </div>

            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-sm font-medium text-blue-100">Available to Claim</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatNumber(stream.withdrawableAmount)} <span className="text-blue-200">{stream.tokenSymbol}</span>
                </p>
              </div>
              <div className="text-right">
                <span className={`ml-3 px-3 py-1 text-xs font-medium rounded-full ${
                  stream.isActive
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                }`}>
                  {stream.isActive ? 'ACTIVE' : 'COMPLETED'}
                </span>
              </div>
            </div>

            {/* Animated stream line */}
            <div className="absolute bottom-0 left-0 h-1 w-full">
              <div className="h-full bg-white opacity-30 animate-stream"></div>
            </div>
          </div>
        )}

        {/* Withdraw button */}
        <Button
          onClick={() => onWithdraw(stream.id)}
          disabled={
            !stream.isActive ||
            parseFloat(stream.withdrawableAmount) <= 0 ||
            isProcessing ||
            isConfirming
          }
          className={`w-full py-3 mt-1 font-medium ${
            !stream.isActive || parseFloat(stream.withdrawableAmount) <= 0 || isProcessing || isConfirming
              ? 'bg-gray-300 text-gray-500'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Withdraw Tokens'
          )}
        </Button>
      </div>
    </div>
  );
}
