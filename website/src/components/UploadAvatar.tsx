import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BsPersonPlus } from 'react-icons/bs';
import { Field } from './Fieldset';
import * as Sentry from '@sentry/nextjs';
import { publishMediaToIpfs, safeGetMediaFromIpfs } from '@effectiveacceleration/contracts';
import useFetchAvatar from '@/hooks/useFetchAvatar';

const ipfsGatewayUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ?? '';
const serviceSecret = process.env.NEXT_PUBLIC_IPFS_UPLOAD_SERVICE_SECRET;

interface UploadAvatarProps {
  avatar: string | undefined;
  setAvatar: (value: string | undefined) => void;
  setAvatarFileUrl: (value: string | undefined) => void;
}

const UploadAvatar = ({
  avatar,
  setAvatar,
  setAvatarFileUrl,
}: UploadAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sessionKey, setSessionKey] = useState<string>();
  const avatarUrl = useFetchAvatar(avatar, sessionKey);
  const uploadToIPFS = async (file: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const dataFile = await file.arrayBuffer();
      const mimeType = file.type;
      const { cid } = await publishMediaToIpfs(
        file.name,
        mimeType,
        new Uint8Array(dataFile),
        sessionKey
      );
      setAvatarFileUrl(cid);
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error uploading file to IPFS:', error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
      uploadToIPFS(file);
    }
  };

  return (
    <Field>
      <input
        type='file'
        name='avatar'
        accept='image/*'
        ref={fileInputRef}
        className='hidden'
        onChange={handleFileChange}
      />
      <button
        onClick={handleAvatarClick}
        className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300'
      >
        {avatar ? (
          <img
            src={avatar.length > 100 ? avatar : avatarUrl}
            alt='Avatar'
            className='h-full w-full rounded-full object-cover'
          />
        ) : (
          <BsPersonPlus className='text-2xl' />
        )}
      </button>
    </Field>
  );
};

export default UploadAvatar;
