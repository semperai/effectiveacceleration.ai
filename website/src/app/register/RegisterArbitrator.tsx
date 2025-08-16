'use client';

import { Alert, AlertDescription } from '@/components/Alert';
import { Field, FieldGroup, Label } from '@/components/Fieldset';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import UploadAvatar from '@/components/UploadAvatar';
import useArbitrator from '@/hooks/subsquid/useArbitrator';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import * as Sentry from '@sentry/nextjs';
import {
  AlertCircle,
  User,
  FileText,
  CheckCircle,
  ArrowRight,
  Home,
  Gavel,
  Shield,
  Info,
  DollarSign,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import type { ExtendedUser } from '@/hooks/subsquid/useUser';

// View shown when user is already registered as both user and arbitrator
const AlreadyRegisteredView = () => {
  const router = useRouter();

  return (
    <div className='relative flex w-full max-w-md transform flex-col overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-md transition-all dark:bg-gray-900/95'>
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
            You are already registered as both a user and an arbitrator. You can
            manage your profiles from the dashboard.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className='group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl active:scale-[0.98]'
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

interface RegisterArbitratorProps {
  encryptionPublicKey: string;
  existingUser?: ExtendedUser | null;
}

const RegisterArbitrator: React.FC<RegisterArbitratorProps> = ({
  encryptionPublicKey,
  existingUser,
}) => {
  const Config = useConfig();
  // State management - pre-populate with existing user data if available
  const [formState, setFormState] = useState({
    avatar: existingUser?.avatar || '',
    avatarFileUrl: existingUser?.avatar || '',
    userName: existingUser?.name || '',
    userBio: existingUser?.bio || '',
    fee: '500', // Default 500 bips (5%)
    error: '',
    isSubmitting: false,
  });

  // Hooks
  const { address } = useAccount();
  const { data: arbitrator } = useArbitrator(address!);
  const router = useRouter();
  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();
  const { showError } = useToast();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  if (arbitrator) {
    return <AlreadyRegisteredView />;
  }

  // Form update handlers
  const updateFormField = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Handle successful arbitrator registration
  const handleSuccessfulSubmission = () => {
    // Store arbitrator data in session
    const updatedArbitrator = {
      address_: address,
      publicKey: encryptionPublicKey,
      name: formState.userName,
      bio: formState.userBio,
      avatar: formState.avatarFileUrl,
    };

    sessionStorage.setItem(
      `arbitrator-${address}`,
      JSON.stringify(updatedArbitrator)
    );
    router.push('/dashboard');
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
        functionName: 'registerArbitrator',
        args: [
          encryptionPublicKey,
          formState.userName,
          formState.userBio,
          formState.avatarFileUrl,
          formState.fee,
        ],
      });
    } catch (error) {
      Sentry.captureException(error);
      const errMsg = 'Failed to register as arbitrator. Please try again.';
      showError(errMsg);
      setFormState((prev) => ({
        ...prev,
        error: errMsg,
        isSubmitting: false,
      }));
      console.error('Error writing contract', error);
    }
  };

  return (
    <div className='relative flex w-full max-w-lg transform flex-col self-center overflow-hidden rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-md transition-all dark:bg-gray-900/95'>
      {/* Decorative gradient background */}
      <div className='absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/20 dark:via-gray-900 dark:to-blue-950/20' />

      <div className='relative z-10 flex flex-col space-y-6'>
        {/* Header with icon */}
        <div className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg'>
            <Gavel className='h-8 w-8 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Register as Arbitrator
          </h1>
          <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
            Help resolve disputes and maintain platform integrity
          </p>
        </div>

        {/* Info box if user exists */}
        {existingUser && (
          <div className='flex items-start gap-3 rounded-lg bg-blue-50/50 p-3 dark:bg-blue-900/20'>
            <Info className='h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <div className='text-sm text-gray-700 dark:text-gray-300'>
              <p className='font-medium'>Your user profile detected</p>
              <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                We&apos;ve pre-filled your information. You can adjust it
                specifically for your arbitrator profile if needed.
              </p>
            </div>
          </div>
        )}

        {/* Benefits of being an arbitrator */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3 rounded-lg bg-gray-50/50 p-2 dark:bg-gray-800/50'>
            <Shield className='h-4 w-4 text-purple-600 dark:text-purple-400' />
            <span className='text-xs text-gray-700 dark:text-gray-300'>
              Earn fees for resolving disputes fairly
            </span>
          </div>
          <div className='flex items-center gap-3 rounded-lg bg-gray-50/50 p-2 dark:bg-gray-800/50'>
            <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
            <span className='text-xs text-gray-700 dark:text-gray-300'>
              Build reputation as a trusted arbitrator
            </span>
          </div>
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
            <Label>Arbitrator Profile Picture</Label>
            <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
              {existingUser
                ? 'Keep your existing avatar or upload a new one'
                : 'Add an avatar to build trust'}
            </p>
            <UploadAvatar
              avatar={formState?.avatar}
              setAvatar={(value) => updateFormField('avatar', value as string)}
              setAvatarFileUrl={(value) =>
                updateFormField('avatarFileUrl', value as string)
              }
            />
          </Field>

          {/* Name field */}
          <Field>
            <Label>
              Arbitrator Name <span className='text-red-500'>*</span>
            </Label>
            <Input
              name='name'
              value={formState.userName}
              placeholder='Enter your arbitrator name'
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
            <Label>Arbitrator Bio</Label>
            <Textarea
              name='bio'
              value={formState.userBio}
              placeholder='Describe your experience, expertise, and approach to fair dispute resolution...'
              onChange={(e) => updateFormField('userBio', e.target.value)}
              rows={3}
              className='mt-1'
            />
            <div className='mt-1 flex justify-between'>
              <p className='text-xs text-gray-500'>
                Describe your arbitration expertise
              </p>
              <p className='text-xs text-gray-500'>
                {formState.userBio.length}/255
              </p>
            </div>
          </Field>

          {/* Fee field */}
          <Field>
            <Label>
              Arbitration Fee (basis points){' '}
              <span className='text-red-500'>*</span>
            </Label>
            <Input
              name='fee'
              type='number'
              min='0'
              max='10000'
              step='1'
              value={formState.fee}
              placeholder='Enter fee in basis points (100 = 1%)'
              onChange={(e) => updateFormField('fee', e.target.value)}
              required
              className='mt-1'
            />
            <div className='mt-1 flex justify-between'>
              <p className='text-xs text-gray-500'>
                100 basis points = 1% (e.g., 500 = 5%)
              </p>
              <p className='text-xs text-gray-500'>
                {formState.fee} bips (
                {(parseInt(formState.fee) / 100 || 0).toFixed(2)}%)
              </p>
            </div>
            <div className='mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20'>
              <Info className='h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400' />
              <p className='text-xs text-amber-700 dark:text-amber-300'>
                <span className='font-medium'>Important:</span> The fee cannot
                be changed after registration. Choose carefully.
              </p>
            </div>
          </Field>
        </FieldGroup>

        <div className='space-y-3'>
          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!formState.userName || formState.isSubmitting}
            className='w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:from-purple-700 hover:to-blue-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-purple-600 disabled:hover:to-blue-600 disabled:hover:shadow-md disabled:active:scale-100'
          >
            <span className='flex items-center justify-center gap-2 text-white'>
              {formState.isSubmitting ? (
                <>
                  <div className='h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                  <span className='text-white'>
                    Registering as Arbitrator...
                  </span>
                </>
              ) : (
                <>
                  <Gavel className='h-5 w-5 text-white' />
                  <span className='text-white'>Register as Arbitrator</span>
                </>
              )}
            </span>
          </button>

          <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
            By registering, you agree to uphold fair and impartial arbitration
            standards
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterArbitrator;
