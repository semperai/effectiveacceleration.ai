import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import type { Address } from 'viem';
import { MaxUint256 } from 'ethers';
import { Button } from '@/components/Button';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import ERC20Abi from '@/abis/ERC20.json';
import { Alert, AlertDescription } from '@/components/Alert';
import { Loader2 } from 'lucide-react';
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
      <Alert variant='destructive'>
        <AlertDescription>
          Error checking token allowance. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const buttonText = isApproved
    ? 'Approved'
    : isApproving || isConfirming
      ? 'Approving...'
      : 'Approve';

  return (
    <Button
      onClick={handleApprove}
      disabled={isApproving || isConfirming || isApproved || allowanceIsLoading}
      className='min-w-[120px]'
    >
      {(isApproving || isConfirming) && (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      )}
      {buttonText}
    </Button>
  );
};
