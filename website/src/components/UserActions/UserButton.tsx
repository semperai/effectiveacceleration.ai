import { Button } from '@/components/Button';
import { CheckIcon, UserIcon } from '@heroicons/react/20/solid';
import {
  getEncryptionSigningKey,
  Job,
  JobEventWithDiffs,
  publishToIpfs,
  User,
} from 'effectiveacceleration-contracts';
import { MARKETPLACE_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceV1';
import Config from 'effectiveacceleration-contracts/scripts/config.json';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Listbox, ListboxOption } from '../Listbox';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import useUsers from '@/hooks/useUsers';
import { Textarea } from '../Textarea';
import useArbitrators from '@/hooks/useArbitrators';
import { Field, Label } from '../Fieldset';
import { Input } from '../Input';
import { tokenIcon, tokensMap } from '@/tokens';
import { zeroAddress } from 'viem';
import { formatUnits, parseUnits } from 'ethers';
import { Radio, RadioGroup } from '../Radio';
import useUser from '@/hooks/useUser';
import useArbitrator from '@/hooks/useArbitrator';
import { MARKETPLACE_DATA_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceDataV1';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { ConnectButton } from '@/components/ConnectButton';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import UploadAvatar from '../UploadAvatar';
import { isImageValid } from '@/utils/ImageValidity';

export function UserButton({ ...rest }: React.ComponentPropsWithoutRef<'div'>) {
  const viewAsValues = ['User', 'Arbitrator'];
  const [viewAs, setViewAs] = useState<string>(viewAsValues[0]);
  const signer = useEthersSigner();
  const { address, connector } = useAccount();
  const { data: user } = useUser(address!);
  const { data: arbitrator } = useArbitrator(address!);
  const users = [user, arbitrator];
  const [userIndex, setUserIndex] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatar, setAvatar] = useState<string | undefined>('');
  const [avatarFileUrl, setAvatarFileUrl] = useState<string | undefined>('');
  const [newAvatar, setNewAvatar] = useState<string | undefined>('');
  const [nameError, setNameError] = useState<string>('');
  const [bioError, setBioError] = useState<string>('');
  const [avatarError, setAvatarError] = useState<string>();
  const [fee, setFee] = useState<number>();
  const [isImgValid, setIsImgValid] = useState<boolean>(false);

  useEffect(() => {
    const avatarUrl = users[userIndex]?.avatar;
    if (users[userIndex]?.name) {
      setName(users[userIndex].name);
    }
    if (users[userIndex]?.bio) {
      setBio(users[userIndex].bio);
    }
    setAvatarFileUrl(avatarUrl);
    setNewAvatar(avatarUrl);
    setAvatar(avatarUrl);
    setFee(arbitrator?.fee ?? 0);
  }, [user, arbitrator]);

  const { data: hash, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed || error) {
      if (avatar !== newAvatar) {
        setAvatar(newAvatar);
      }
      if (error) {
        const revertReason = error.message.match(
          `The contract function ".*" reverted with the following reason:\n(.*)\n.*`
        )?.[1];
        if (revertReason) {
          alert(
            error.message.match(
              `The contract function ".*" reverted with the following reason:\n(.*)\n.*`
            )?.[1]
          );
        } else {
          console.log(error, error.message);
          alert('Unknown error occurred');
        }
      }

      sessionStorage.removeItem(`user-${address}`);
      sessionStorage.removeItem(`arbitrator-${address}`);

      setButtonDisabled(false);
      closeModal();
    }
  }, [isConfirmed, error]);

  useEffect(() => {
    if (avatar) {
      isImageValid(avatar)
        .then((isValid) => setIsImgValid(isValid))
        .catch((error) => {
          console.error('Error checking image URL:', error);
          setIsImgValid(false);
        });
    }
  }, [avatar]);

  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  async function updateButtonClick() {
    setButtonDisabled(true);

    const methodName = userIndex === 0 ? 'updateUser' : 'updateArbitrator';

    const w = writeContract({
      abi: MARKETPLACE_DATA_V1_ABI,
      address: Config.marketplaceDataAddress as `0x${string}`,
      functionName: methodName,
      args: [name!, bio!, avatarFileUrl!],
    });
  }

  async function registerButtonClick() {
    setButtonDisabled(true);

    const encryptionPublicKey = (await getEncryptionSigningKey(signer as any))
      .compressedPublicKey;

    if (userIndex === 0) {
      const w = writeContract({
        abi: MARKETPLACE_DATA_V1_ABI,
        address: Config.marketplaceDataAddress as `0x${string}`,
        functionName: 'registerUser',
        args: [
          encryptionPublicKey as `0x${string}`,
          name!,
          bio!,
          avatarFileUrl!,
        ],
      });
    } else {
      const w = writeContract({
        abi: MARKETPLACE_DATA_V1_ABI,
        address: Config.marketplaceDataAddress as `0x${string}`,
        functionName: 'registerArbitrator',
        args: [
          encryptionPublicKey as `0x${string}`,
          name!,
          bio!,
          avatarFileUrl!,
          fee!,
        ],
      });
    }
  }

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  function validateName() {
    if (!name || name.length === 0) {
      setNameError('Name is required');
      return;
    }
    if (name.length >= 20) {
      setNameError('Name is too long (20 characters max)');
      return;
    }

    setNameError('');
  }

  function validateBio() {
    // could have not loaded yet
    // 0 length is ok
    if (!bio) {
      setBioError('');
      return;
    }

    if (bio.length >= 255) {
      setBioError('Bio is too long (255 characters max)');
      return;
    }

    setBioError('');
  }

  useEffect(() => {
    validateName();
    validateBio();

    if (nameError || bioError) {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  }, [name, bio]);

  return (
    <>
      <span className=''>
        {user ? (
          <button
            onClick={() => openModal()}
            className='relative flex h-10 w-10 items-center overflow-hidden rounded-full bg-primary p-2 align-middle'
          >
            {avatar === '' ||
            avatar === undefined ||
            avatar === null ||
            !isImgValid ? (
              <span className='inline-block h-6 w-6 text-white'>
                {name && name[0].toUpperCase()}
                {!name && (
                  <UserIcon
                    className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300'
                    aria-hidden='true'
                  />
                )}
              </span>
            ) : (
              <Image
                className='h-full w-full object-cover'
                fill
                src={avatar as string | StaticImport}
                alt={'Profile picture'}
              ></Image>
            )}
          </button>
        ) : (
          <ConnectButton />
        )}
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
                      User info
                    </Dialog.Title>
                    <div className='mb-3 mt-5 flex flex-col gap-2'>
                      {(user || arbitrator) && (
                        <>
                          <Field>
                            <Label>Address</Label>
                            <Input value={address} readOnly />
                          </Field>
                          <Field>
                            <Label>Name</Label>
                            <Input
                              value={name}
                              onChange={(e) => {
                                setName(e.target.value);
                              }}
                            />
                            {nameError && (
                              <div className='text-xs' style={{ color: 'red' }}>
                                {nameError}
                              </div>
                            )}
                          </Field>
                          <Field>
                            <Label>Bio</Label>
                            <Input
                              value={bio}
                              onChange={(e) => {
                                setBio(e.target.value);
                              }}
                            />
                            {bioError && (
                              <div className='text-xs' style={{ color: 'red' }}>
                                {bioError}
                              </div>
                            )}
                          </Field>
                          <span className='text-sm font-bold'>Avatar</span>
                          <UploadAvatar
                            avatar={newAvatar}
                            setAvatar={setNewAvatar}
                            setAvatarFileUrl={setAvatarFileUrl}
                          />

                          {userIndex === 1 && (
                            <Field>
                              <Label>Fee</Label>
                              <Input
                                type='number'
                                value={fee}
                                readOnly={arbitrator !== undefined}
                                onChange={(e) => setFee(Number(e.target.value))}
                                invalid={['-', 'e', '.'].some((char) =>
                                  String(fee).includes(char)
                                )}
                              />
                            </Field>
                          )}
                          {user && userIndex === 0 && (
                            <Field>
                              <p className='whitespace-nowrap'>
                                <span className='text-green-500 dark:text-green-400'>
                                  +{user.reputationUp}
                                </span>
                                <span className='text-red-500 dark:text-red-400'>
                                  -{user.reputationDown}
                                </span>{' '}
                                reputation
                              </p>
                            </Field>
                          )}
                          {arbitrator && userIndex === 1 && (
                            <Field>
                              <p className='whitespace-nowrap'>
                                <span className='text-green-500 dark:text-green-400'>
                                  +{arbitrator.settledCount}
                                </span>
                                <span className='text-red-500 dark:text-red-400'>
                                  -{arbitrator.refusedCount}
                                </span>{' '}
                                reputation
                              </p>
                            </Field>
                          )}

                          {users[userIndex] && (
                            <Button
                              disabled={
                                buttonDisabled ||
                                nameError.length > 0 ||
                                bioError.length > 0
                              }
                              onClick={updateButtonClick}
                            >
                              <CheckIcon
                                className='-ml-0.5 mr-1.5 h-5 w-5'
                                aria-hidden='true'
                              />
                              Update
                            </Button>
                          )}
                          {!users[userIndex] && (
                            <Button
                              disabled={buttonDisabled}
                              onClick={registerButtonClick}
                            >
                              <CheckIcon
                                className='-ml-0.5 mr-1.5 h-5 w-5'
                                aria-hidden='true'
                              />
                              Register
                            </Button>
                          )}
                        </>
                      )}

                      <ConnectButton />
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </span>
    </>
  );
}
