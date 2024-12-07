import React, { useRef } from 'react';
import { BsPersonPlus } from 'react-icons/bs';
import { Field } from './Fieldset';
import * as Sentry from '@sentry/nextjs';

const ipfsGatewayUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ?? '';

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

  const uploadToIPFS = async (file: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // TODO this should be controlled by environment not posting to localhost first
      const response = await fetch('http://localhost:5001/api/v0/add', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file to IPFS');
      }

      const data = await response.json();
      const url = `${ipfsGatewayUrl}/ipfs/${data.Hash}`;
      setAvatarFileUrl(url);
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error uploading file to IPFS:', error);
      // TODO show toast here
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
            src={avatar}
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
