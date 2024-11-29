'use client';

import clsx from 'clsx';
import { Button } from '@/components/Button';
import { Field, FieldGroup, Label } from '@/components/Fieldset';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import UploadAvatar from '@/components/UploadAvatar';
import useUser from '@/hooks/subsquid/useUser';
import Config from '@effectiveacceleration/contracts/scripts/config.json';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { PostJobParams } from '../dashboard/post-job/PostJobPage';
import { Alert, AlertDescription } from '@/components/Alert';
import RegisterSidebarImage from '@/images/register-sidebar-man.jpg';

interface CreateProfileProps {
  encryptionPublicKey: string;
}

const CreateProfile: React.FC<CreateProfileProps> = ({
  encryptionPublicKey,
}) => {
  // State management
  const [formState, setFormState] = useState({
    avatar: '',
    avatarFileUrl: '',
    userName: '',
    userBio: '',
    error: '',
    isSubmitting: false,
  });

  // Hooks
  const { address } = useAccount();
  const { data: user } = useUser(address!);
  const router = useRouter();
  const { data: hash, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const unregisteredUserLabel = `${address}-unregistered-job-cache`;

  // Form update handlers
  const updateFormField = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Handle contract interaction results
  useEffect(() => {
    if (!isConfirmed && !error) return;

    if (error) {
      const revertReason = error.message.match(
        /The contract function ".*" reverted with the following reason:\n(.*)\n.*/
      )?.[1];
      setFormState((prev) => ({
        ...prev,
        error: revertReason || 'An unknown error occurred',
        isSubmitting: false,
      }));
      return;
    }

    if (isConfirmed) {
      handleSuccessfulSubmission();
    }
  }, [isConfirmed, error]);

  // Handle successful profile creation
  const handleSuccessfulSubmission = () => {
    const jobsAfterSignUp: PostJobParams[] = JSON.parse(
      sessionStorage.getItem(unregisteredUserLabel) || '[]'
    );

    const updatedUser = {
      ...user,
      address_: address,
      publicKey: encryptionPublicKey,
      name: formState.userName,
      bio: formState.userBio,
      avatar: formState.avatarFileUrl,
    };

    sessionStorage.setItem(`user-${address}`, JSON.stringify(updatedUser));

    // Redirect based on whether there's a pending job post
    const hasUnfinishedJob = jobsAfterSignUp[0]?.title;
    router.push(hasUnfinishedJob ? '/dashboard/post-job' : '/dashboard');
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!formState.userName) {
      setFormState((prev) => ({ ...prev, error: 'Please set a name' }));
      return;
    }

    if (formState.userName.length >= 20) {
      setFormState((prev) => ({
        ...prev,
        error: 'Name must be less than 20 characters',
      }));
      return;
    }

    if (formState.userBio.length >= 255) {
      setFormState((prev) => ({
        ...prev,
        error: 'Bio must be less than 255 characters',
      }));
      return;
    }


    setFormState((prev) => ({ ...prev, isSubmitting: true, error: '' }));

    try {
      await writeContract({
        abi: MARKETPLACE_DATA_V1_ABI,
        address: Config.marketplaceDataAddress as string,
        functionName: 'registerUser',
        args: [
          encryptionPublicKey,
          formState.userName,
          formState.userBio,
          formState.avatarFileUrl,
        ],
      });
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        error: 'Failed to create profile. Please try again.',
        isSubmitting: false,
      }));
      console.error('Error writing contract: ', error);
    }
  };

  return (
    <div className='flex flex-row self-center shadow-xl'>
      <Image
        className='hidden md:block z-10 rounded-l-md object-cover mix-blend-overlay animate-pulse'
        src={RegisterSidebarImage}
        height={500}
        width={350}
        alt='Registration welcome image'
        priority
      />

      <div className='flex w-full max-w-md transform flex-col justify-center gap-y-4 self-center overflow-hidden rounded-md rounded-l-none bg-white p-8 text-left align-middle transition-all'>
        <h1 className='text-2xl font-extrabold'>Create a Profile</h1>

        {formState.error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{formState.error}</AlertDescription>
          </Alert>
        )}

        <FieldGroup className='my-2 flex-1 space-y-6'>
          <div className='space-y-2'>
            <span className='text-sm text-gray-600'>
              Add an avatar to stand out from the crowd
            </span>
            <UploadAvatar
              avatar={formState.avatar}
              setAvatar={(value) => updateFormField('avatar', value as string)}
              setAvatarFileUrl={(value) =>
                updateFormField('avatarFileUrl', value as string)
              }
            />
          </div>

          <Field>
            <Label>Your Name</Label>
            <Input
              name='name'
              value={formState.userName}
              placeholder='Enter your name'
              onChange={(e) => updateFormField('userName', e.target.value)}
              required
            />
          </Field>

          <Field>
            <Label>About Yourself</Label>
            <Textarea
              name='bio'
              value={formState.userBio}
              placeholder='Tell us about yourself...'
              onChange={(e) => updateFormField('userBio', e.target.value)}
              rows={4}
            />
          </Field>
        </FieldGroup>

        <span className='text-sm text-primary'>
          * Name and avatar can be changed later
        </span>

        <Button
          onClick={handleSubmit}
          disabled={!formState.userName || formState.isSubmitting}
          className='w-full'
        >
          {formState.isSubmitting ? 'Creating Profile...' : 'Create Profile'}
        </Button>
      </div>
    </div>
  );
};

export default CreateProfile;
