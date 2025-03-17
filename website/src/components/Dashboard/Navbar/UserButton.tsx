import { Button } from '@/components/Button';
import { ConnectButton } from '@/components/ConnectButton';
import useArbitrator from '@/hooks/subsquid/useArbitrator';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import useUser from '@/hooks/subsquid/useUser';
import { isImageValid } from '@/utils/ImageValidity';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { PiUser } from 'react-icons/pi';
import { getEncryptionSigningKey } from '@effectiveacceleration/contracts';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import { Fragment, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Field, Label } from '@/components/Fieldset';
import { Input } from '@/components/Input';
import UploadAvatar from '@/components/UploadAvatar';
import { useConfig } from '@/hooks/useConfig';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import * as Sentry from '@sentry/nextjs';
import useFetchAvatar from '@/hooks/useFetchAvatar';

interface NavButtonProps {
  name: string | undefined;
  avatar: string | undefined;
  openModal: () => void;
}

const NavButton = ({ name, avatar, openModal }: NavButtonProps) => {
  const [isImgValid, setIsImgValid] = useState<boolean>(false);
  const [sessionKey, setSessionKey] = useState<string>();
  const avatarUrl = useFetchAvatar(avatar, sessionKey);

  useEffect(() => {
    if (avatar) {
      isImageValid(avatar)
        .then((isValid) => setIsImgValid(isValid))
        .catch((error) => {
          Sentry.captureException(error);
          console.error('Error checking image URL:', error);
          // TODO show toast here
          setIsImgValid(false);
        });
    }
  }, [avatar]);

  return (
    <button
      onClick={() => openModal()}
      className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200'
    >
      {avatar === '' ||
      avatar === undefined ||
      avatar === null ||
      !avatarUrl ? (
        <PiUser
          className='h-5 w-5 flex-shrink-0 text-gray-600'
          aria-hidden='true'
        />
      ) : (
        <Image
          className='h-full w-full rounded-full object-cover'
          width={64}
          height={64}
          src={avatarUrl as string | StaticImport}
          alt={'Profile picture'}
        />
      )}
    </button>
  );
};

export function UserButton({ ...rest }: React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const viewAsValues = ['User', 'Arbitrator'];
  const signer = useEthersSigner();
  const { address } = useAccount();
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
  const [fee, setFee] = useState<number>();
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const { writeContractWithNotifications, isConfirming, isConfirmed } =
    useWriteContractWithNotifications();

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

  useEffect(() => {
    setButtonDisabled(false);
  }, [isConfirmed]);

  async function updateButtonClick() {
    setButtonDisabled(true);

    const methodName = userIndex === 0 ? 'updateUser' : 'updateArbitrator';

    await writeContractWithNotifications({
      abi: MARKETPLACE_DATA_V1_ABI,
      address: Config!.marketplaceDataAddress,
      functionName: methodName,
      args: [name!, bio!, avatarFileUrl!],
    });
  }

  async function registerButtonClick() {
    setButtonDisabled(true);

    const encryptionPublicKey = (await getEncryptionSigningKey(signer as any))
      .compressedPublicKey;

    if (userIndex === 0) {
      await writeContractWithNotifications({
        abi: MARKETPLACE_DATA_V1_ABI,
        address: Config!.marketplaceDataAddress,
        functionName: 'registerUser',
        args: [encryptionPublicKey, name!, bio!, avatarFileUrl!],
      });
    } else {
      await writeContractWithNotifications({
        abi: MARKETPLACE_DATA_V1_ABI,
        address: Config!.marketplaceDataAddress,
        functionName: 'registerArbitrator',
        args: [encryptionPublicKey, name!, bio!, avatarFileUrl!, fee!],
      });
    }
  }

  useEffect(() => {
    const nameErrorEncountered = (() => {
      if (!name || name.length === 0) {
        setNameError('Name is required');
        return true;
      }
      if (name.length >= 20) {
        setNameError('Name is too long (20 characters max)');
        return true;
      }

      setNameError('');
      return false;
    })();

    const bioErrorEncountered = (() => {
      // could have not loaded yet
      // 0 length is ok
      if (!bio) {
        setBioError('');
        return false;
      }

      if (bio.length >= 255) {
        setBioError('Bio is too long (255 characters max)');
        return true;
      }

      setBioError('');
      return false;
    })();

    if (nameErrorEncountered || bioErrorEncountered) {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  }, [name, bio]);

  return (
    <>
      <NavButton name={name} avatar={avatar} openModal={() => setOpen(true)} />
      <Transition appear show={open} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50'
          onClose={() => setOpen(false)}
        >
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
                <Dialog.Panel className='w-full p-8 max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all'>
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
                          <Field className='py-2'>
                            Reputation
                            <p className='whitespace-nowrap'>
                              <span className='text-green-500 pr-4'>
                                +{user.reputationUp}
                              </span>
                              <span className='text-red-500'>
                                -{user.reputationDown}
                              </span>{' '}

                            </p>
                          </Field>
                        )}
                        {arbitrator && userIndex === 1 && (
                          <Field>
                            <p className='whitespace-nowrap'>
                              <span className='text-green-500'>
                                +{arbitrator.settledCount}
                              </span>
                              <span className='text-red-500'>
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
    </>
  );
}
