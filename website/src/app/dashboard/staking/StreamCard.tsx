'use client';

// Interface representing processed stream data
interface Stream {
  id: string;
  tokenId: string;
  token: string;
  tokenSymbol: string;
  tokenType: string;
  startTime: Date;
  endTime: Date;
  percentComplete: number;
  isActive: boolean;
  isWithdrawing: boolean;
  // Real-time data
  withdrawableAmount: string;
  lastUpdated: number;
  colorScheme: string; // For styling the card based on token type
}

interface StreamCardProps {
  stream: Stream;
  onWithdraw: (streamId: string, tokenId: string) => void;
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
  const getRemainingDays = (): number => {
    const now = new Date();
    const diffTime = stream.endTime.getTime() - now.getTime();
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

  // Map color scheme to CSS classes
  const getColorClasses = () => {
    const scheme = stream.colorScheme || 'blue';
    const colorMap = {
      blue: {
        cardGradient: {
          active: 'from-blue-50 to-indigo-50',
          completed: 'from-gray-50 to-gray-100'
        },
        progressGradient: {
          active: 'from-blue-500 to-indigo-600',
          completed: 'from-gray-400 to-gray-500'
        },
        pill: {
          active: 'from-green-500 to-emerald-500',
          completed: 'from-gray-500 to-gray-600'
        },
        withdrawBox: {
          gradient: 'from-blue-500 to-indigo-600',
          textLight: 'text-blue-100',
          textDark: 'text-blue-200'
        }
      },
      purple: {
        cardGradient: {
          active: 'from-purple-50 to-indigo-50',
          completed: 'from-gray-50 to-gray-100'
        },
        progressGradient: {
          active: 'from-purple-500 to-indigo-600',
          completed: 'from-gray-400 to-gray-500'
        },
        pill: {
          active: 'from-purple-500 to-indigo-500',
          completed: 'from-gray-500 to-gray-600'
        },
        withdrawBox: {
          gradient: 'from-purple-500 to-indigo-600',
          textLight: 'text-purple-100',
          textDark: 'text-purple-200'
        }
      },
      // Add other color schemes as needed
      gray: {
        cardGradient: {
          active: 'from-gray-50 to-gray-100',
          completed: 'from-gray-50 to-gray-100'
        },
        progressGradient: {
          active: 'from-gray-500 to-gray-600',
          completed: 'from-gray-400 to-gray-500'
        },
        pill: {
          active: 'from-gray-500 to-gray-600',
          completed: 'from-gray-500 to-gray-600'
        },
        withdrawBox: {
          gradient: 'from-gray-600 to-gray-700',
          textLight: 'text-gray-200',
          textDark: 'text-gray-300'
        }
      }
    };

    const colorSet = colorMap[scheme as keyof typeof colorMap] || colorMap.blue;
    const state = stream.isActive ? 'active' : 'completed';

    return {
      cardGradient: `bg-gradient-to-br ${colorSet.cardGradient[state]}`,
      progressGradient: `bg-gradient-to-r ${colorSet.progressGradient[state]}`,
      pillGradient: `bg-gradient-to-r ${colorSet.pill[state]}`,
      withdrawBoxGradient: `bg-gradient-to-r ${colorSet.withdrawBox.gradient}`,
      withdrawBoxTextLight: colorSet.withdrawBox.textLight,
      withdrawBoxTextDark: colorSet.withdrawBox.textDark
    };
  };

  const colors = getColorClasses();

  // Determine background gradient based on stream status
  const getCardGradient = () => {
    if (!stream.isActive) {
      return 'bg-gradient-to-br from-gray-50 to-gray-100';
    }
    return colors.cardGradient;
  };

  // Determine progress bar gradient
  const getProgressGradient = () => {
    if (!stream.isActive) {
      return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
    return colors.progressGradient;
  };

  // Calculate time remaining as percentage
  const timeRemainingPercent = () => {
    if (!stream.isActive) return 100;
    return stream.percentComplete;
  };

  // Calculate remaining days text
  const remainingDaysText = () => {
    const days = getRemainingDays();
    return days <= 0 ? "Completed" : `${days} days remaining`;
  };

  // Is the stream currently processing a withdrawal?
  const isProcessing = stream.isWithdrawing || withdrawingStreams[stream.id];

  // Determine if the card is clickable for withdrawal
  const isWithdrawable = stream.isActive &&
                        parseFloat(stream.withdrawableAmount) > 0 &&
                        !isProcessing &&
                        !isConfirming;

  // Handle card click for withdrawal
  const handleCardClick = () => {
    if (isWithdrawable) {
      onWithdraw(stream.id, stream.tokenId);
    }
  };

  return (
    <div
      className={`${getCardGradient()} rounded-2xl shadow-lg overflow-hidden transition-all duration-300
        ${isWithdrawable ? 'hover:shadow-xl transform hover:-translate-y-1 cursor-pointer' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Top status bar with badge */}
      <div className="relative h-1.5 w-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full ${getProgressGradient()} ${stream.isActive ? 'animate-pulse-slow' : ''}`}
          style={{ width: `${stream.percentComplete}%` }}
        ></div>
      </div>

      <div className="p-5">
        {/* Stream type badge */}
        <div className="flex justify-end mb-2">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
            {stream.tokenSymbol}
          </span>
        </div>

        {/* Withdrawable amount section with pulsing animation */}
        {stream.isActive && (
          <div className={`${colors.withdrawBoxGradient} p-5 rounded-xl mb-5 text-white relative overflow-hidden shadow-md`}>
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
                <p className={`text-sm font-medium ${colors.withdrawBoxTextLight}`}>Available to Claim</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatNumber(stream.withdrawableAmount)} <span className={colors.withdrawBoxTextDark}>{stream.tokenSymbol}</span>
                </p>
              </div>
              <div className="text-right">
                <span className={`ml-3 px-3 py-1 text-xs font-medium rounded-full ${
                  stream.isActive
                    ? colors.pillGradient
                    : 'bg-gradient-to-r from-gray-500 to-gray-600'
                } text-white`}>
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

        {/* Time remaining bar */}
        <div className="mt-4 mb-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{remainingDaysText()}</span>
            <span>{timeRemainingPercent()}% complete</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressGradient()}`}
              style={{ width: `${timeRemainingPercent()}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
