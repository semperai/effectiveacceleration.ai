import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/subsquid/useUser';
import { Job, publishToIpfs } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { useEffect, useState } from 'react';
import { PiPaperPlaneRight } from 'react-icons/pi';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Textarea } from '../Textarea';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { Loader2 } from 'lucide-react';

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
    const { showError } = useToast();
  
    const {
      writeContractWithNotifications,
      isConfirming,
      isConfirmed,
      error
    } = useWriteContractWithNotifications();
    
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  async function handlePostMessage() {
      console.log('HANDLED POST MESSAGE')
      if (!user) {
        router.push('/register');
        return;
      }
  
      const sessionKey = sessionKeys[`${address}-${selectedUserRecipient}`];
      const { hash: contentHash } = await publishToIpfs(message, sessionKey);

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'postThreadMessage',
        args: [BigInt(job.id!), contentHash, selectedUserRecipient],
      });
    } catch (err: any) {
      showError(`Error refunding job: ${err.message}`);
    } finally {
      setIsPostingMessage(false);
    }
  }

  return (
    <>
      <div className='w-full'>
        <div className='flex items-center justify-center text-center'>
          <div className='flex w-full flex-row gap-x-5 p-3'>
            <Textarea
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Type a new message'
              className='w-full !rounded'
            />
            <Button
              disabled={isPostingMessage || isConfirming}
              onClick={handlePostMessage}
              color='lightBlue'
            >        
              {(isPostingMessage || isConfirming) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <PiPaperPlaneRight className='text-xl text-white' />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
