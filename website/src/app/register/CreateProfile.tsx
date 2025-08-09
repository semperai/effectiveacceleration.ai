'use client';

import { Alert, AlertDescription } from '@/components/Alert';
import { Field, FieldGroup, Label } from '@/components/Fieldset';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import UploadAvatar from '@/components/UploadAvatar';
import useUser from '@/hooks/subsquid/useUser';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, User, FileText, CheckCircle, ArrowRight, Home, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { PostJobParams } from '../dashboard/post-job/PostJobPage';

const RegisteredUserView = () => {
  const router = useRouter();

  return (
    <div className='relative flex w-full max-w-md transform flex-col overflow-hidden rounded-3xl bg-white/95 backdrop-blur-md p-8 shadow-2xl transition-all dark:bg-gray-900/95'>
      {/* Decorative gradient background */}
      <div className='absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-950/20 dark:via-gray-900 dark:to-blue-950/20' />
      
      <div className='relative z-10 flex flex-col space-y-8'>
        {/* Success icon */}
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg'>
          <CheckCircle className='h-8 w-8 text-white' />
        </div>

        {/* Content */}
        <div className='space-y-3 text-center'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Already Registered
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            You already have a registered profile. You can view and edit your
            profile by clicking your profile picture in the dashboard.
          </p>
          <p className='text-sm text-gray-500 dark:text-gray-500'>
            To register with a different account, switch your connected wallet.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className='group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:from-blue-700 hover:to-blue-800 active:scale-[0.98]'
        >
          <span className='relative z-10 flex items-center justify-center gap-2 text-white'>
            <Home className='h-5 w-5 text-white' />
            <span className='text-white'>Go to Dashboard</span>
            <ArrowRight className='h-4 w-4 text-white transition-transform group-hover:translate-x-1' />
          </span>
        </button>
      </div>
    </div>
  );
};

interface CreateProfileProps {
  encryptionPublicKey: string;
}

const CreateProfile: React.FC<CreateProfileProps> = ({
  encryptionPublicKey,
}) => {
  const Config = useConfig();
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
  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();
  const { showError } = useToast();

  const unregisteredUserLabel = `${address}-unregistered-job-cache`;
  
  useEffect(() => {
    if (error) {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  }, [error]);

  useEffect(() => {
    if (isConfirmed) {
      handleSuccessfulSubmission();
    }
  }, [isConfirmed]);

  if (user) {
    return <RegisteredUserView />;
  }

  // Form update handlers
  const updateFormField = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Handle successful profile creation
  const handleSuccessfulSubmission = () => {
    const jobsAfterSignUp: PostJobParams[] = JSON.parse(
      sessionStorage.getItem(unregisteredUserLabel) || '[]'
    );

    const updatedUser = {
      ...(user ?? {}),
      address_: address,
      publicKey: encryptionPublicKey,
      name: formState.userName,
      bio: formState.userBio,
      avatar: formState.avatarFileUrl,
    };

    sessionStorage.setItem(`user-${address}`, JSON.stringify(updatedUser));

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
      await writeContractWithNotifications({
        abi: MARKETPLACE_DATA_V1_ABI,
        address: Config!.marketplaceDataAddress,
        functionName: 'registerUser',
        args: [
          encryptionPublicKey,
          formState.userName,
          formState.userBio,
          formState.avatarFileUrl,
        ],
      });
    } catch (error) {
      Sentry.captureException(error);
      const errMsg = 'Failed to create profile. Please try again.';
      showError(errMsg);
      setFormState((prev) => ({
        ...prev,
        error: errMsg,
        isSubmitting: false,
      }));
      console.error('Error writing contract: ', error);
    }
  };

  return (
    <div className='relative flex w-full max-w-lg transform flex-col self-center overflow-hidden rounded-3xl bg-white/95 backdrop-blur-md p-8 shadow-2xl transition-all dark:bg-gray-900/95'>
      {/* Decorative gradient background */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-gray-900 dark:to-purple-950/20' />
      
      <div className='relative z-10 flex flex-col space-y-6'>
        {/* Header with icon */}
        <div className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'>
            <Sparkles className='h-8 w-8 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Create Your Profile
          </h1>
          <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
            Tell us a bit about yourself to get started
          </p>
        </div>

        {/* Error alert */}
        {formState.error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{formState.error}</AlertDescription>
          </Alert>
        )}

        <FieldGroup className='space-y-5'>
          {/* Avatar upload */}
          <Field>
            <Label>Profile Picture</Label>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>
              Add an avatar to stand out
            </p>
            <UploadAvatar
              avatar={formState?.avatar}
              setAvatar={(value) =>
                updateFormField('avatar', value as string)
              }
              setAvatarFileUrl={(value) =>
                updateFormField('avatarFileUrl', value as string)
              }
            />
          </Field>

          {/* Name field */}
          <Field>
            <Label>
              Your Name <span className='text-red-500'>*</span>
            </Label>
            <Input
              name='name'
              value={formState.userName}
              placeholder='Enter your name'
              onChange={(e) => updateFormField('userName', e.target.value)}
              required
              className='mt-1'
            />
            <div className='mt-1 flex justify-between'>
              <p className='text-xs text-gray-500'>Required</p>
              <p className='text-xs text-gray-500'>
                {formState.userName.length}/20
              </p>
            </div>
          </Field>

          {/* Bio field */}
          <Field>
            <Label>About Yourself</Label>
            <Textarea
              name='bio'
              value={formState.userBio}
              placeholder='Share your skills, interests, and goals...'
              onChange={(e) => updateFormField('userBio', e.target.value)}
              rows={3}
              className='mt-1'
            />
            <div className='mt-1 flex justify-between'>
              <p className='text-xs text-gray-500'>Optional</p>
              <p className='text-xs text-gray-500'>
                {formState.userBio.length}/255
              </p>
            </div>
          </Field>
        </FieldGroup>

        <div className='space-y-3'>
          {/* Submit button - simpler, cleaner design */}
          <button
            onClick={handleSubmit}
            disabled={!formState.userName || formState.isSubmitting}
            className='w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:shadow-md disabled:active:scale-100'
          >
            <span className='flex items-center justify-center gap-2 text-white'>
              {formState.isSubmitting ? (
                <>
                  <div className='h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                  <span className='text-white'>Creating Profile...</span>
                </>
              ) : (
                <>
                  <User className='h-5 w-5 text-white' />
                  <span className='text-white'>Create Profile</span>
                </>
              )}
            </span>
          </button>

          <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
            You can update your profile anytime from the dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
