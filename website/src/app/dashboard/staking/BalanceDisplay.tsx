'use client';
import { formatEther } from 'viem';

interface BalanceDisplayProps {
  eaccBalance: bigint | null;
  eaxxBalance: bigint | null;
  eaxxWorthInEACC: bigint | null;
}

export const BalanceDisplay = ({ eaccBalance, eaxxBalance, eaxxWorthInEACC }: BalanceDisplayProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
        <div className="flex items-center mb-1">
          <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">EACC Balance</p>
            <p className="text-2xl font-bold text-blue-900">
              {eaccBalance && typeof eaccBalance === 'bigint'
                ? parseFloat(formatEther(eaccBalance)).toFixed(4)
                : '0.0000'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl p-6">
        <div className="flex items-center mb-1">
          <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-indigo-600 font-medium">EAXX Balance</p>
            <p className="text-2xl font-bold text-indigo-900">
              {eaxxBalance && typeof eaxxBalance === 'bigint'
                ? parseFloat(formatEther(eaxxBalance)).toFixed(4)
                : '0.0000'}
              <br />
              {eaxxWorthInEACC && typeof eaxxWorthInEACC === 'bigint' && eaxxWorthInEACC > 0 && (
                <span className="text-sm text-indigo-500 ml-2">
                  (~{parseFloat(formatEther(eaxxWorthInEACC)).toFixed(4)} EACC)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
