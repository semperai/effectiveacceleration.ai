'use client';
import { Button } from '@/components/Button';
import { Field, FieldGroup, Label } from '@/components/Fieldset';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import UploadAvatar from '@/components/UploadAvatar';
import useUser from '@/hooks/subsquid/useUser';
import Config from '@effectiveacceleration/contracts/scripts/config.json';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { PostJobParams } from '../dashboard/post-job/PostJobPage';

const CreateProfile = ({
  encryptionPublicKey,
}: {
  encryptionPublicKey: string;
}) => {
  const [avatar, setAvatar] = useState<string | undefined>('');
  const [avatarFileUrl, setAvatarFileUrl] = useState<string | undefined>('');
  const [userName, setName] = useState<string>('');
  const [userBio, setBio] = useState<string>('');
  const { address } = useAccount();
  const { data: user } = useUser(address!);
  const userCopy = { ...user };
  const router = useRouter();
  const unregisteredUserLabel = `${address}-unregistered-job-cache`;

  const { data: hash, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed || error) {
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
      if (isConfirmed) {
        const jobsAfterSignUp = JSON.parse(
          sessionStorage.getItem(unregisteredUserLabel) || '[]'
        );
        const savedJob: PostJobParams = jobsAfterSignUp[0];
        userCopy.address_ = address;
        userCopy.publicKey = encryptionPublicKey;
        userCopy.name = userName;
        userCopy.bio = userBio;
        userCopy.avatar = avatarFileUrl;
        sessionStorage.setItem(`user-${address}`, JSON.stringify(userCopy));
        // If savedJob.title exist then this unregistered user is comming from posting a job
        if (savedJob?.title) {
          router.push('/dashboard/post-job');
          return;
        }
        router.push('/dashboard');
      }
    }
  }, [isConfirmed, error]);

  const submit = () => {
    if (avatarFileUrl === undefined) return;
    try {
      const w = writeContract({
        abi: MARKETPLACE_DATA_V1_ABI,
        address: Config.marketplaceDataAddress as string,
        functionName: 'registerUser',
        args: [encryptionPublicKey as string, userName, userBio, avatarFileUrl],
      });
    } catch (error) {
      console.error('Error writing contract: ', error);
    }
  };

  return (
    <div className='flex flex-row self-center shadow-xl'>
      <Image
        className='z-10 rounded-l-md'
        src={'/registerImage.jpg'}
        height={50}
        width={350}
        alt={''}
      ></Image>
      <div className='flex w-full max-w-md transform flex-col justify-center gap-y-2 self-center overflow-hidden rounded-md rounded-l-none bg-white p-6 text-left align-middle transition-all'>
        <h1 className='text-xl font-extrabold'>Create a Profile</h1>
        <FieldGroup className='my-2 flex-1'>
          <span className='mb-4'>
            Add an avatar to stand out from the crowd
          </span>
          <UploadAvatar
            avatar={avatar}
            setAvatar={setAvatar}
            setAvatarFileUrl={setAvatarFileUrl}
          />
          <Field>
            <Label>Your Name</Label>
            <Input
              name='name'
              value={userName}
              placeholder='Name'
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
            {/* {titleError && <div className='text-xs' style={{ color: 'red' }}>{titleError}</div>} */}
          </Field>
          <Field>
            <Label>About Yourself</Label>
            <Textarea
              name='title'
              value={userBio}
              placeholder='About Yourself'
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setBio(e.target.value)
              }
            />
            {/* {titleError && <div className='text-xs' style={{ color: 'red' }}>{titleError}</div>} */}
          </Field>
        </FieldGroup>
        <span className='text-sm text-primary'>
          * Name and avatar can be changed later
        </span>
        <Button onClick={submit} disabled={userName === ''}>
          Create Profile
        </Button>
      </div>
    </div>
  );
};

export default CreateProfile;
