import { Button } from '@/components/Button';
import useArbitrator from '@/hooks/subsquid/useArbitrator';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import useUser from '@/hooks/subsquid/useUser';
import { isImageValid } from '@/lib/utils';
import { Dialog, Transition } from '@headlessui/react';
import {
  getEncryptionSigningKey,
  type User,
} from '@effectiveacceleration/contracts';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { Fragment, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Field, Label } from '@/components/Fieldset';
import { Input } from '@/components/Input';
import { useConfig } from '@/hooks/useConfig';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import * as Sentry from '@sentry/nextjs';
import useFetchAvatar from '@/hooks/useFetchAvatar';
import ProfileImage from '@/components/ProfileImage';
import { ReviewsList } from './ReviewsList';

interface NavButtonProps {
  name: string | undefined;
  avatar: string | undefined;
  openModal: () => void;
  text?: string;
  children?: React.ReactNode;
}

interface ReputationProps {
  positiveCount: number;
  negativeCount: number;
}

const Reputation = ({ positiveCount, negativeCount }: ReputationProps) => (
  <Field className=''>
    <Label>Reputation</Label>
    <div className='py-3'>
      <p className='whitespace-nowrap'>
        <span className='mr-2 rounded-full border border-gray-300 p-2 text-green-500'>
          +{positiveCount}
        </span>
        <span className='text-red rounded-full border border-gray-300 p-2'>
          -{negativeCount}
        </span>
      </p>
    </div>
  </Field>
);

const NavButton = ({ name, avatar, children, openModal }: NavButtonProps) => {
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
    <button onClick={() => openModal()} className='hover:text-primary'>
      {children || 'View Profile'}
    </button>
  );
};

interface UserProfileProps extends React.ComponentPropsWithoutRef<'div'> {
  selectedUser?: User;
  children?: React.ReactNode;
}

export function UserProfile({
  selectedUser,
  children,
  ...rest
}: UserProfileProps) {
  const Config = useConfig();
  const viewAsValues = ['User', 'Arbitrator'];
  const signer = useEthersSigner();
  const { address } = useAccount();
  const { data: user } = useUser(address!);
  const { data: arbitrator } = useArbitrator(address!);
  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatar, setAvatar] = useState<string | undefined>('');
  const [avatarFileUrl, setAvatarFileUrl] = useState<string | undefined>('');
  const [newAvatar, setNewAvatar] = useState<string | undefined>('');
  const [nameError, setNameError] = useState<string>('');
  const [bioError, setBioError] = useState<string>('');
  const [fee, setFee] = useState<number>();
  const [showReviewsButtonDisabled, setShowReviewsButtonDisabled] =
    useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const { writeContractWithNotifications, isConfirming, isConfirmed } =
    useWriteContractWithNotifications();

  useEffect(() => {
    let avatarUrl;
    if (user?.avatar) {
      avatarUrl = user.avatar;
    } else if (arbitrator?.avatar) {
      avatarUrl = arbitrator.avatar;
    }

    if (user?.name) {
      setName(user.name);
    } else if (arbitrator?.name) {
      setName(arbitrator.name);
    }

    if (user?.bio) {
      setBio(user.bio);
    } else if (arbitrator?.bio) {
      setBio(arbitrator.bio);
    }

    setAvatarFileUrl(avatarUrl);
    setNewAvatar(avatarUrl);
    setAvatar(avatarUrl);
    setFee(arbitrator?.fee ?? 0);
  }, [user, arbitrator]);

  useEffect(() => {
    setShowReviewsButtonDisabled(false);
  }, [isConfirmed]);

  async function updateButtonClick() {
    setShowReviewsButtonDisabled(true);

    let methodName;
    if (user) {
      methodName = 'updateUser';
    } else if (arbitrator) {
      methodName = 'updateArbitrator';
    }

    if (!methodName) {
      console.error('No method name found for update');
      return;
    }

    await writeContractWithNotifications({
      abi: MARKETPLACE_DATA_V1_ABI,
      address: Config!.marketplaceDataAddress,
      functionName: methodName,
      args: [name!, bio!, avatarFileUrl!],
    });
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
      setShowReviewsButtonDisabled(true);
    } else {
      setShowReviewsButtonDisabled(false);
    }
  }, [name, bio]);

  return (
    <>
      <NavButton name={name} avatar={avatar} openModal={() => setOpen(true)}>
        {children}
      </NavButton>
      <Transition appear show={open} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50'
          onClose={() => {
            setOpen(false);
            setShowReviews(false);
          }} // Reset on close
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
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all'>
                  <div className='mb-2 flex flex-col items-center gap-2'>
                    {(user || arbitrator) && (
                      <>
                        {!showReviews ? (
                          <>
                            <div className='flex h-[110px] w-[110px] items-center justify-center'>
                              {selectedUser?.name && (
                                <ProfileImage
                                  className={'h-full w-full'}
                                  user={selectedUser}
                                ></ProfileImage>
                              )}
                            </div>
                            <Dialog.Title
                              as='h3'
                              className='text-lg font-medium leading-6 text-gray-900'
                            >
                              {selectedUser?.name}
                            </Dialog.Title>
                            <span className='font-md text-sm'>
                              {selectedUser?.bio}
                            </span>

                            {arbitrator && (
                              <Field>
                                <Label>Fee</Label>
                                <Input
                                  type='number'
                                  value={fee}
                                  readOnly={arbitrator !== undefined}
                                  onChange={(e) =>
                                    setFee(Number(e.target.value))
                                  }
                                  invalid={['-', 'e', '.'].some((char) =>
                                    String(fee).includes(char)
                                  )}
                                />
                              </Field>
                            )}

                            {user && (
                              <Reputation
                                positiveCount={selectedUser?.reputationUp ?? 0}
                                negativeCount={
                                  selectedUser?.reputationDown ?? 0
                                }
                              />
                            )}

                            {(user || arbitrator) && (
                              <Button
                                disabled={
                                  showReviewsButtonDisabled ||
                                  nameError.length > 0 ||
                                  bioError.length > 0
                                }
                                onClick={() => setShowReviews(true)}
                              >
                                View Reviews
                              </Button>
                            )}
                          </>
                        ) : (
                          <ReviewsList
                            selectedUser={selectedUser}
                            setShowReviews={setShowReviews}
                            address={selectedUser?.address_}
                          />
                        )}
                      </>
                    )}
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
