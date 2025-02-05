import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { Job, publishMediaToIpfs, publishToIpfs } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon, TrashIcon } from '@heroicons/react/20/solid';
import * as Sentry from '@sentry/nextjs';
import { ZeroHash } from 'ethers';
import { Fragment, useCallback, useRef, useState } from 'react';
import { Textarea } from '../Textarea';
import { Input } from '../Input';

export type DeliverResultButtonProps = {
  address: string | undefined;
  sessionKeys: Record<string, string>;
  job: Job;
};

export function DeliverResultButton({
  address,
  job,
  sessionKeys,
  ...rest
}: DeliverResultButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [message, setMessage] = useState<string>('');
  const [file, setFile] = useState<File>();
  const [isDelivering, setIsDelivering] = useState(false);
  const { showError, showSuccess, showLoading, toast } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  const loadingToastIdRef = useRef<string | number | null>(null);

  // Cleanup function for dismissing loading toasts
  const dismissLoadingToast = useCallback(() => {
    if (loadingToastIdRef.current !== null) {
      toast.dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [toast]);

  // const publish = useCallback(
  //   async () => {
  //     if (!file) {
  //       return;
  //     }

  //     const sessionKey = sessionKeys[`${job.roles.creator}-${address}`];
  //     if (!sessionKey) {
  //       throw new Error('DeliverReslutButton: No session key found');
  //     }

  //     const data = await file.arrayBuffer();
  //     const mimeType = file.type;
  //     const { cid } = await publishMediaToIpfs(
  //       mimeType,
  //       new Uint8Array(data),
  //       sessionKey
  //     );
  //     const downloadHash =
  //       '#' +
  //       encodeURIComponent(
  //         `filename=${file.name}&cid=${cid}${sessionKey ? `&sessionKey=${sessionKey}` : ''}`
  //       );
  //     setDownloadHash(downloadHash);
  //     setMarkdownContent(
  //       (prev) => prev + `\n\n[${file.name}](${downloadHash}) download link`
  //     );
  //   },
  //   [file]
  // );

  const handleDeliver = useCallback(async () => {
    setIsDelivering(true);

    let contentHash = ZeroHash;
    const sessionKey = sessionKeys[`${job.roles.creator}-${address}`];
    if (!sessionKey) {
      throw new Error('DeliverReslutButton: No session key found');
    }

    if (message.length > 0 || file) {
      dismissLoadingToast();
      loadingToastIdRef.current = showLoading('Publishing job results to IPFS...');
      try {
        if (file) {
          const data = await file.arrayBuffer();
          const mimeType = file.type;
          const { hash } = await publishMediaToIpfs(
            file.name,
            mimeType,
            new Uint8Array(data),
            sessionKey
          );
          contentHash = hash;
        } else {
          const { hash } = await publishToIpfs(message, sessionKey);
          contentHash = hash;
        }

      } catch (err) {
        Sentry.captureException(err);
        dismissLoadingToast();
        showError('Failed to publish job results to IPFS');
        setIsDelivering(false);
        return;
      }
      dismissLoadingToast();
      showSuccess('Job results published to IPFS');
    }

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'deliverResult',
        args: [BigInt(job.id!), contentHash],
      });
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error delivering job: ${err.message}`);
    } finally {
      setIsDelivering(false);
    }
  }, [file, sessionKeys, address, job, message])

  const buttonText = isDelivering ? 'Delivering...' : 'Deliver';

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
        disabled={isDelivering}
        onClick={() => openModal()}
        color={'borderlessGray'}
        className={'w-full'}
      >
        Deliver Result
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
                    Deliver Result
                  </Dialog.Title>
                  <div className='mb-3 mt-5 flex flex-col gap-5'>
                    <Textarea
                      disabled={isDelivering || file !== undefined}
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder='Please write a message providing the deliverable for the job. Include links etc'
                      className='mt-5'
                    />
                    <div>or alternatively upload a file with results</div>
                    <div className='flex flex-row'>
                      <Input
                        type='file'
                        id='file'
                        name='file'
                        onChange={(e) => setFile(e.target.files?.[0]!)}
                      />
                      {file && <div className='w-[48px] h-[48px] rounded-xl ml-2 mt-1.5 p-1 border-[rgb(79 70 229)] border-2'><TrashIcon onClick={() => setFile(undefined)}></TrashIcon></div>}
                    </div>
                    <Button
                      disabled={isDelivering || (message === '' && file === undefined)}
                      onClick={handleDeliver}
                    >
                      <CheckIcon
                        className='-ml-0.5 mr-1.5 h-5 w-5'
                        aria-hidden='true'
                      />
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
