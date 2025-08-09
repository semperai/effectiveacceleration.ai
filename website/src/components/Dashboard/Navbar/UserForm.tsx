import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Field, Label } from '@/components/Fieldset';
import { Input } from '@/components/Input';
import UploadAvatar from '@/components/UploadAvatar';
import { useConfig } from '@/hooks/useConfig';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { getEncryptionSigningKey } from '@effectiveacceleration/contracts';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { User, Arbitrator } from '@effectiveacceleration/contracts';
import { UserReputation } from './UserReputation';
import { validateUserForm } from './utils/userValidation';

interface UserFormProps {
  isArbitrator: boolean;
  user?: User;
  arbitrator?: Arbitrator;
  address: string;
}

export const UserForm = ({ isArbitrator, user, arbitrator, address }: UserFormProps) => {
  const Config = useConfig();
  const signer = useEthersSigner();
  const currentEntity = isArbitrator ? arbitrator : user;
  
  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatarFileUrl, setAvatarFileUrl] = useState<string | undefined>('');
  const [newAvatar, setNewAvatar] = useState<string | undefined>('');
  const [fee, setFee] = useState<number>(0);
  const [errors, setErrors] = useState({ name: '', bio: '', fee: '' });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { writeContractWithNotifications, isConfirming, isConfirmed } =
    useWriteContractWithNotifications();

  useEffect(() => {
    if (currentEntity) {
      setName(currentEntity.name || '');
      setBio(currentEntity.bio || '');
      setAvatarFileUrl(currentEntity.avatar);
      setNewAvatar(currentEntity.avatar);
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

  const handleRegister = async () => {
    setIsSubmitting(true);
    const encryptionPublicKey = (await getEncryptionSigningKey(signer as any))
      .compressedPublicKey;

    if (isArbitrator) {
      await writeContractWithNotifications({
        abi: MARKETPLACE_DATA_V1_ABI,
        address: Config!.marketplaceDataAddress,
        functionName: 'registerArbitrator',
        args: [encryptionPublicKey, name!, bio!, avatarFileUrl!, fee!],
      });
    } else {
      await writeContractWithNotifications({
        abi: MARKETPLACE_DATA_V1_ABI,
        address: Config!.marketplaceDataAddress,
        functionName: 'registerUser',
        args: [encryptionPublicKey, name!, bio!, avatarFileUrl!],
      });
    }
  };

  const hasErrors = Object.values(errors).some(error => error.length > 0);

  return (
    <div className='flex flex-col gap-3'>
      <Field>
        <Label>Address</Label>
        <Input 
          value={address} 
          readOnly 
          className='text-xs sm:text-sm font-mono'
        />
      </Field>
      
      <Field>
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Enter your name'
        />
        {errors.name && (
          <div className='text-xs text-red-500 mt-1'>
            {errors.name}
          </div>
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
          <div className='text-xs text-red-500 mt-1'>
            {errors.bio}
          </div>
        )}
      </Field>
      
      <Field>
        <Label>Avatar</Label>
        <UploadAvatar
          avatar={newAvatar}
          setAvatar={setNewAvatar}
          setAvatarFileUrl={setAvatarFileUrl}
        />
      </Field>

      {isArbitrator && (
        <Field>
          <Label>Arbitration Fee</Label>
          <Input
            type='number'
            value={fee}
            readOnly={arbitrator !== undefined}
            onChange={(e) => setFee(Number(e.target.value))}
            placeholder='Set your fee'
          />
          {errors.fee && (
            <div className='text-xs text-red-500 mt-1'>
              {errors.fee}
            </div>
          )}
        </Field>
      )}

      {currentEntity && (
        <UserReputation
          isArbitrator={isArbitrator}
          positiveCount={
            isArbitrator 
              ? (arbitrator?.settledCount || 0)
              : (user?.reputationUp || 0)
          }
          negativeCount={
            isArbitrator
              ? (arbitrator?.refusedCount || 0)
              : (user?.reputationDown || 0)
          }
        />
      )}

      {currentEntity ? (
        <Button
          disabled={isSubmitting || hasErrors || isConfirming}
          onClick={handleUpdate}
          className='w-full'
        >
          {isConfirming ? 'Updating...' : 'Update Profile'}
        </Button>
      ) : (
        <Button
          disabled={isSubmitting || hasErrors || isConfirming}
          onClick={handleRegister}
          className='w-full'
        >
          {isConfirming ? 'Registering...' : `Register as ${isArbitrator ? 'Arbitrator' : 'User'}`}
        </Button>
      )}
    </div>
  );
};
