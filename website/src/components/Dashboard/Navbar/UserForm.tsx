import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Field, Label } from '@/components/Fieldset';
import { Input } from '@/components/Input';
import UploadAvatar from '@/components/UploadAvatar';
import { useConfig } from '@/hooks/useConfig';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import type { User, Arbitrator } from '@effectiveacceleration/contracts';
import { UserReputation } from './UserReputation';
import { validateUserForm } from './utils/userValidation';
import { PiArrowSquareOut } from 'react-icons/pi';
import { Info } from 'lucide-react';

interface UserFormProps {
  isArbitrator: boolean;
  user?: User;
  arbitrator?: Arbitrator;
  address: string;
}

export const UserForm = ({
  isArbitrator,
  user,
  arbitrator,
  address,
}: UserFormProps) => {
  const Config = useConfig();
  const currentEntity = isArbitrator ? arbitrator : user;

  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatar, setAvatar] = useState<string | undefined>('');
  const [avatarFileUrl, setAvatarFileUrl] = useState<string | undefined>('');
  const [fee, setFee] = useState<number>(0);
  const [errors, setErrors] = useState({ name: '', bio: '', fee: '' });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { writeContractWithNotifications, isConfirming, isConfirmed } =
    useWriteContractWithNotifications();

  useEffect(() => {
    if (currentEntity) {
      setName(currentEntity.name || '');
      setBio(currentEntity.bio || '');
      setAvatar(currentEntity.avatar || '');
      setAvatarFileUrl(currentEntity.avatar || '');
    }
    if (arbitrator) {
      setFee(arbitrator.fee || 0);
    }
  }, [currentEntity, arbitrator]);

  useEffect(() => {
    setIsSubmitting(false);
  }, [isConfirmed]);

  useEffect(() => {
    const validationErrors = validateUserForm({ name, bio, fee, isArbitrator });
    setErrors(validationErrors);
  }, [name, bio, fee, isArbitrator]);

  const handleUpdate = async () => {
    setIsSubmitting(true);
    const methodName = isArbitrator ? 'updateArbitrator' : 'updateUser';

    await writeContractWithNotifications({
      abi: MARKETPLACE_DATA_V1_ABI,
      address: Config!.marketplaceDataAddress,
      functionName: methodName,
      args: [name!, bio!, avatarFileUrl!],
    });
  };

  const hasErrors = Object.values(errors).some((error) => error.length > 0);
  const isDisabled = isSubmitting || hasErrors || isConfirming;

  // This component should only be shown to registered users
  if (!currentEntity) {
    return null;
  }

  return (
    <div className='flex flex-col gap-3'>
      <Field>
        <Label>Address</Label>
        <div className='flex gap-2'>
          <Input
            value={address}
            readOnly
            className='flex-1 font-mono text-xs sm:text-sm'
          />
          <Link
            href={`/dashboard/${isArbitrator ? 'arbitrators' : 'users'}/${address}`}
            className='inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300'
            title='View public profile'
          >
            <span className='hidden sm:inline'>View Profile</span>
            <PiArrowSquareOut className='h-4 w-4' />
          </Link>
        </div>
      </Field>

      <Field>
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Enter your name'
        />
        {errors.name && (
          <div className='mt-1 text-xs text-red-500'>{errors.name}</div>
        )}
      </Field>

      <Field>
        <Label>Bio</Label>
        <Input
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder='Tell us about yourself'
        />
        {errors.bio && (
          <div className='mt-1 text-xs text-red-500'>{errors.bio}</div>
        )}
      </Field>

      <Field>
        <Label>Avatar</Label>
        <UploadAvatar
          avatar={avatar}
          setAvatar={setAvatar}
          setAvatarFileUrl={setAvatarFileUrl}
        />
      </Field>

      {isArbitrator && (
        <Field>
          <Label>Arbitration Fee (basis points)</Label>
          <div className='relative'>
            <Input
              type='number'
              value={fee}
              readOnly={true}
              className='bg-gray-50 dark:bg-gray-800'
            />
            <div className='mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20'>
              <Info className='h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400' />
              <div className='text-xs text-amber-700 dark:text-amber-300'>
                <span className='font-medium'>Fee is immutable:</span> Your
                arbitration fee ({fee} bips = {(fee / 100).toFixed(2)}%) cannot
                be changed after registration.
              </div>
            </div>
          </div>
        </Field>
      )}

      <UserReputation
        isArbitrator={isArbitrator}
        positiveCount={
          isArbitrator ? arbitrator?.settledCount || 0 : user?.reputationUp || 0
        }
        negativeCount={
          isArbitrator
            ? arbitrator?.refusedCount || 0
            : user?.reputationDown || 0
        }
      />

      <button
        disabled={isDisabled}
        onClick={handleUpdate}
        className={`relative w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
          isDisabled
            ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-600 dark:hover:bg-blue-700'
        } `}
        style={!isDisabled ? { color: 'white' } : undefined}
      >
        <span
          className='flex items-center justify-center gap-2'
          style={!isDisabled ? { color: 'white' } : undefined}
        >
          {isConfirming ? (
            <>
              <svg
                className='h-4 w-4 animate-spin'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              <span>Updating...</span>
            </>
          ) : (
            'Update Profile'
          )}
        </span>
      </button>
    </div>
  );
};
