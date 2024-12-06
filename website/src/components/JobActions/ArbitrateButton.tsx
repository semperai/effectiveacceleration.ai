import { Button } from '@/components/Button';
import { Dialog, Transition } from '@headlessui/react';
import { Job, publishToIpfs } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Field, Label } from '../Fieldset';
import { Input } from '../Input';
import { Textarea } from '../Textarea';
import { useConfig } from '@/hooks/useConfig';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { ZeroHash } from 'ethers';

export type ArbitrateButtonProps = {
  address: string | undefined;
  sessionKeys: Record<string, string>;
  job: Job;
};

export function ArbitrateButton({
  address,
  job,
  sessionKeys,
  ...rest
}: ArbitrateButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [sharesSlider, setSharesSlider] = useState<number>(0.5);
  const [ownerShare, setOwnerShare] = useState<number>(5000);
  const [workerShare, setWorkerShare] = useState<number>(5000);
  const [message, setMessage] = useState<string>('');

  const [isArbitrating, setIsArbitrating] = useState(false);
  const { showError, showSuccess, showLoading, toast } = useToast();
  const loadingToastIdRef = useRef<string | number | null>(null);

  // Cleanup function for dismissing loading toasts
  const dismissLoadingToast = useCallback(() => {
    if (loadingToastIdRef.current !== null) {
      toast.dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [toast]);

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handleArbitrate() {
    if (workerShare + ownerShare !== 10000) {
      alert('Shares must sum to 10000');
      return;
    }
    setIsArbitrating(true);
    let contentHash = ZeroHash;
    const sessionKey = sessionKeys[`${address}-${job.roles.creator}`];

    if (message.length > 0) {
      dismissLoadingToast();
      loadingToastIdRef.current = showLoading('Publishing job post to IPFS...');
      try {
        const { hash } = await publishToIpfs(message, sessionKey);
        contentHash = hash;
      } catch (err) {
        dismissLoadingToast();
        showError('Failed to publish job post to IPFS');
        setIsArbitrating(false);
        return;
      }
      dismissLoadingToast();
      showSuccess('Job post published to IPFS');
    }

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'arbitrate',
        args: [BigInt(job.id!), ownerShare, workerShare, contentHash],
      });
    } catch (err: any) {
      showError(`Error Arbitrating job: ${err.message}`);
    } finally {
      setIsArbitrating(false);
    }
  }

  const buttonText = isArbitrating ? 'Arbitrating...' : 'Arbitrate';

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <Button
        disabled={isArbitrating || isConfirming}
        onClick={() => openModal()}
        color={'borderlessGray'}
        className={'w-full'}
      >
        Arbitrate
      </Button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-gray-900'
                  >
                    Arbitrate
                  </Dialog.Title>
                  <div className='mb-3 mt-5 flex flex-col gap-5'>
                    <Field>
                      <Label>Shares owner / worker</Label>
                      <label className='mb-2 block text-sm font-medium text-gray-900'>
                        Shares owner / worker
                      </label>
                      <input
                        type='range'
                        value={sharesSlider}
                        min='0'
                        max='1'
                        step='0.00001'
                        className='range-lg h-3 w-full cursor-pointer appearance-none rounded-lg bg-gray-200'
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          const ownerShare = Math.floor(v * 10000);

                          setOwnerShare(ownerShare);
                          setWorkerShare(10000 - ownerShare);

                          setSharesSlider(v);
                        }}
                      />
                    </Field>

                    <Field>
                      <Label>Creator share</Label>
                      <Input
                        value={ownerShare}
                        type='number'
                        min='0'
                        max='10000'
                        step='1'
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          const ownerShare = Math.floor(v);

                          setOwnerShare(ownerShare);
                          setWorkerShare(10000 - ownerShare);

                          setSharesSlider(v / 10000);
                        }}
                        placeholder='Owner Share %'
                      />
                    </Field>
                    <Field>
                      <Label>Worker share</Label>
                      <Input
                        value={workerShare}
                        type='number'
                        min='0'
                        max='10000'
                        step='1'
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          const workerShare = Math.floor(v);
                          const ownerShare = 10000 - workerShare;

                          setWorkerShare(workerShare);
                          setOwnerShare(ownerShare);

                          setSharesSlider(ownerShare / 10000);
                        }}
                        placeholder='Worker Share %'
                      />
                    </Field>
                    <Textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder='Please write a message describing your reasoning for your decision'
                      className='mt-5'
                    />
                    <Button
                      disabled={isArbitrating || message === ''}
                      onClick={handleArbitrate}
                    >
                      Confirm
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
