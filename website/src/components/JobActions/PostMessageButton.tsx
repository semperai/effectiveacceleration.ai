import { Button } from '@/components/Button';
import useUser from '@/hooks/subsquid/useUser';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { type Job, publishToIpfs } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import * as Sentry from '@sentry/nextjs';
import { ZeroHash } from 'ethers';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PiPaperPlaneRight } from 'react-icons/pi';
import { Textarea } from '../Textarea';
import { useWaitForTransactionReceipt } from 'wagmi';

export type PostMessageButtonProps = {
  address: string | undefined;
  recipient: string;
  addresses: string[] | undefined;
  sessionKeys: Record<string, string>;
  job: Job;
};

export function PostMessageButton({
  address,
  recipient,
  addresses,
  job,
  sessionKeys,
  ...rest
}: PostMessageButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const router = useRouter();
  const { data: user } = useUser(address!);
  const [message, setMessage] = useState<string>('');
  const selectedUserRecipient =
    recipient === address ? job.roles.creator : recipient;
  const initialAddressRef = useRef<string | undefined>();
  const [isPostingMessage, setIsPostingMessage] = useState(false);
  const { showError, showSuccess, showLoading, toast } = useToast();

  const loadingToastIdRef = useRef<string | number | null>(null);

  // Cleanup function for dismissing loading toasts
  const dismissLoadingToast = useCallback(() => {
    if (loadingToastIdRef.current !== null) {
      toast.dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [toast]);

  const {
    writeContractWithNotifications,
    isConfirming,
    isConfirmed,
    error,
    hash,
    loadingToastIdRef: contractLoadingToastIdRef,
  } = useWriteContractWithNotifications();

  useEffect(() => {
    if (contractLoadingToastIdRef.current) {
      setIsPostingMessage(true);
    }
    if (isConfirmed) {
      setMessage('');
      setIsPostingMessage(false);
      initialAddressRef.current = address;
    }
    if (error) {
      setIsPostingMessage(false);
      initialAddressRef.current = address;
    }
  }, [isConfirmed, contractLoadingToastIdRef.current, error]);

  useEffect(() => {
    if (isPostingMessage && address !== initialAddressRef.current) {
      showError('Account changed during transaction. Process cancelled.');
      setIsPostingMessage(false);
      dismissLoadingToast();
      initialAddressRef.current = address;
    }
  }, [address, isPostingMessage, showError, dismissLoadingToast]);

  async function handlePostMessage() {
    if (!user) {
      router.push('/register');
      return;
    }
    initialAddressRef.current = address;

    const initialAddress = address;
    const initialRecipient =
      recipient === initialAddress ? job.roles.creator : recipient;

    const sessionKey = sessionKeys[`${initialAddress}-${initialRecipient}`];

    if (!sessionKey) {
      throw new Error('PostMessageButton: No session key found');
    }
    let contentHash = ZeroHash;

    if (message.length > 0) {
      dismissLoadingToast();
      loadingToastIdRef.current = showLoading(
        'Publishing job message to IPFS...'
      );
      setIsPostingMessage(true);
      try {
        const { hash } = await publishToIpfs(message, sessionKey);
        contentHash = hash;
      } catch (err) {
        Sentry.captureException(err);
        dismissLoadingToast();
        showError('Failed to publish job message to IPFS');
        setIsPostingMessage(false);
        return;
      }
      dismissLoadingToast();
      showSuccess('Job message published to IPFS');
    }

    if (address !== initialAddress) {
      showError('Account changed during transaction.');
      setIsPostingMessage(false);
      return;
    }

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'postThreadMessage',
        args: [BigInt(job.id!), contentHash, initialRecipient],
      });
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error posting job message: ${err.message}`);
    } finally {
      setIsPostingMessage(false);
    }
  }

  const isProcessing = isPostingMessage || isConfirming;
  const canSend = message.trim().length > 0 && !isProcessing;

  return (
    <div className='w-full'>
      {/* Unified container with better styling */}
      <div className='flex items-end gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm backdrop-blur-sm transition-all duration-200 focus-within:shadow-md dark:border-gray-700 dark:bg-gray-800/50'>
        {/* Message Input with improved styling - no outline/border */}
        <textarea
          rows={1}
          value={message}
          disabled={isProcessing}
          onChange={(e) => {
            setMessage(e.target.value);

            // Dynamically adjust the height of the textarea
            const textarea = e.target as HTMLTextAreaElement;
            textarea.style.height = 'auto'; // Reset height to calculate the new height

            // Calculate line height and set constraints
            const lineHeight = parseFloat(
              getComputedStyle(textarea).lineHeight || '20'
            );
            const minHeight = lineHeight * 1.5; // Minimum height for better alignment
            const maxHeight = lineHeight * 6; // Maximum 6 lines

            // Set the height based on content
            if (textarea.scrollHeight > minHeight) {
              textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
            } else {
              textarea.style.height = `${minHeight}px`;
            }
          }}
          onKeyDown={(e) => {
            // Send message on Enter (without Shift)
            if (e.key === 'Enter' && !e.shiftKey && canSend) {
              e.preventDefault();
              handlePostMessage();
            }
          }}
          placeholder='Type a message...'
          className={`min-h-[36px] flex-1 resize-none rounded-lg border-0 bg-transparent px-2 py-1 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500 ${isProcessing ? 'cursor-not-allowed opacity-60' : ''} `}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent',
            boxShadow: 'none',
          }}
        />

        {/* Send Button - vertically aligned to bottom */}
        <button
          disabled={!canSend}
          onClick={handlePostMessage}
          className={`relative mb-0 flex h-9 w-9 min-w-[36px] transform items-center justify-center self-end rounded-xl transition-all duration-200 ${
            canSend
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-md shadow-blue-500/20 hover:scale-105 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95'
              : 'cursor-not-allowed bg-gray-100 dark:bg-gray-700/50'
          } `}
          aria-label='Send message'
        >
          {/* Loading state with spinner */}
          {isProcessing ? (
            <div className='relative flex items-center justify-center'>
              {/* Spinner ring */}
              <svg
                className='absolute h-5 w-5 animate-spin text-white/30'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='3'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              {/* Inner icon */}
              <PiPaperPlaneRight className='h-4 w-4 text-white/60' />
            </div>
          ) : (
            /* Normal state - send icon */
            <PiPaperPlaneRight
              className={`h-4 w-4 transition-all duration-200 ${
                canSend ? 'text-white' : 'text-gray-400 dark:text-gray-500'
              } `}
            />
          )}

          {/* Pulse effect when ready to send */}
          {canSend && !isProcessing && (
            <>
              <span className='absolute inset-0 rounded-xl bg-white opacity-0 transition-opacity duration-200 hover:opacity-20' />
              <span
                className='absolute inset-0 animate-ping rounded-xl bg-blue-400 opacity-30'
                style={{
                  animationDuration: '2s',
                  animationIterationCount: '1',
                }}
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
