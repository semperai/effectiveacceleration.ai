import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import type { Address } from 'viem';
import { MaxUint256 } from 'ethers';
import { Button } from '@/components/Button';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import ERC20Abi from '@/abis/ERC20.json';
import { Alert, AlertDescription } from '@/components/Alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

interface ApproveButtonProps {
  token: Address;
  spender: Address;
  onApproveSuccess?: () => void;
  onApproveError?: (error: Error) => void;
}

export const ApproveButton = ({
  token,
  spender,
  onApproveSuccess,
  onApproveError,
}: ApproveButtonProps) => {
  const { address } = useAccount();
  const [isApproving, setIsApproving] = useState(false);

  const {
    data: allowanceData,
    isError: allowanceIsError,
    isLoading: allowanceIsLoading,
    refetch: refetchAllowance,
  } = useReadContract({
    address: token,
    abi: ERC20Abi,
    functionName: 'allowance',
    args: [address, spender],
    query: {
      enabled: !!address && !!token && !!spender,
    },
  });

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  // Reset approving state when confirmation is complete
  useEffect(() => {
    if (isConfirmed) {
      setIsApproving(false);
      refetchAllowance();
      onApproveSuccess?.();
    }
  }, [isConfirmed, onApproveSuccess]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setIsApproving(false);
      onApproveError?.(error);
    }
  }, [error, onApproveError]);

  // Check if token is already approved
  let isApproved = false;
  if (allowanceData && (allowanceData as bigint) > 0n) {
    isApproved = true;
  }

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await writeContractWithNotifications({
        abi: ERC20Abi,
        address: token,
        functionName: 'approve',
        args: [spender, MaxUint256],
      });
    } catch (err) {
      Sentry.captureException(err);
      setIsApproving(false);
      onApproveError?.(err as Error);
    }
  };

  if (allowanceIsError) {
    return (
      <Alert variant='destructive' className='bg-red-50 border-red-200'>
        <AlertCircle className='h-4 w-4 text-red-600' />
        <AlertDescription className='text-red-600'>
          Error checking token allowance. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const buttonText = isApproved
    ? 'Approved'
    : isApproving || isConfirming
      ? 'Approving...'
      : 'Approve Token';

  return (
    <Button
      onClick={handleApprove}
      disabled={isApproving || isConfirming || isApproved || allowanceIsLoading}
      className={`
        min-w-[140px] px-6 py-3 rounded-xl font-medium transition-all duration-200
        ${isApproved
          ? 'bg-green-50 text-green-700 border border-green-200 cursor-not-allowed'
          : isApproving || isConfirming || allowanceIsLoading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
        }
      `}
    >
      {isApproved ? (
        <span className='flex items-center gap-2'>
          <CheckCircle className='h-4 w-4' />
          {buttonText}
        </span>
      ) : (isApproving || isConfirming) ? (
        <span className='flex items-center gap-2'>
          <Loader2 className='h-4 w-4 animate-spin' />
          {buttonText}
        </span>
      ) : (
        buttonText
      )}
    </Button>
  );
};
