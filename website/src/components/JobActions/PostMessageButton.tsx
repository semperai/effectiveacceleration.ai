import { Button } from '@/components/Button';
import useUser from '@/hooks/subsquid/useUser';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { getFromIpfs, Job, publishToIpfs, safeGetFromIpfs } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import * as Sentry from '@sentry/nextjs';
import { ZeroHash } from 'ethers';
import { Loader2 } from 'lucide-react';
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

  const { writeContractWithNotifications, isConfirming, isConfirmed, error, hash, loadingToastIdRef: contractLoadingToastIdRef } =
    useWriteContractWithNotifications();

  useEffect(() => {
      if (contractLoadingToastIdRef.current) {
        setIsPostingMessage(true);
      }
      if (isConfirmed) {
          setMessage('');
          setIsPostingMessage(false);
      }
      if (error) {
        setIsPostingMessage(false);
      }
  }, [isConfirmed, contractLoadingToastIdRef.current, error]);

  async function handlePostMessage() {
    if (!user) {
      router.push('/register');
      return;
    }

    const initialAddress = address;
    const initialRecipient = recipient === initialAddress 
      ? job.roles.creator 
      : recipient;

    const sessionKey = sessionKeys[`${initialAddress}-${initialRecipient}`];

    if (!sessionKey) {
      throw new Error('PostMessageButton: No session key found');
    }
    let contentHash = ZeroHash;

    if (message.length > 0) {
      dismissLoadingToast();
      loadingToastIdRef.current = showLoading('Publishing job message to IPFS...');
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

    const currentAddress = user.address_;
    if (currentAddress !== initialAddress) {
      showError('Account changed during transaction. Please reconnect with original account.');
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

  return (
    <>
      <div className='w-full'>
        <div className='flex items-center justify-center text-center'>
          <div className='flex w-full flex-row gap-x-5 py-2 px-3'>
            <Textarea
              rows={1}
              value={message}
              disabled={isPostingMessage || isConfirming}
              onChange={(e) => {
                setMessage(e.target.value);
            
                // Dynamically adjust the height of the textarea
                const textarea = e.target as HTMLTextAreaElement;
                textarea.style.height = 'auto'; // Reset height to calculate the new height
            
                // Only adjust height if content exceeds one row
                const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight!);
                if (textarea.scrollHeight > lineHeight) {
                  textarea.style.height = `${textarea.scrollHeight}px`; // Set height based on scrollHeight
            
                  // Enforce a maximum height of 6 lines
                  if (textarea.scrollHeight > 6 * lineHeight) {
                    textarea.style.height = `${6 * lineHeight}px`;
                  }
                }
              }}
              placeholder='Type a new message'
              className='w-full !rounded'
            />
            <Button
              disabled={isPostingMessage || isConfirming || message.length === 0}
              onClick={handlePostMessage}
              color='lightBlue'
              className={'max-h-9 self-end'}
            >
              {(isPostingMessage || isConfirming) && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              <PiPaperPlaneRight className='text-xl text-white' />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
