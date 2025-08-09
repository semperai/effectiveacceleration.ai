import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BsPersonPlus } from 'react-icons/bs';
import { Field } from './Fieldset';
import * as Sentry from '@sentry/nextjs';
import { publishMediaToIpfs, safeGetMediaFromIpfs } from '@effectiveacceleration/contracts';
import useFetchAvatar from '@/hooks/useFetchAvatar';
import { useToast } from '@/hooks/useToast';

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
  const loadingToastIdRef = useRef<string | number | null>(null);
  const [sessionKey, setSessionKey] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const avatarUrl = useFetchAvatar(avatar, sessionKey);
  const { showError, showSuccess, showLoading, toast } = useToast();

  // Cleanup function for dismissing loading toasts
  const dismissLoadingToast = useCallback(() => {
    if (loadingToastIdRef.current !== null) {
      toast.dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [toast]);

  const uploadToIPFS = async (file: File): Promise<void> => {
    setIsUploading(true);
    dismissLoadingToast();

    try {
      // Show loading toast
      loadingToastIdRef.current = showLoading('Uploading avatar to IPFS...');

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

      // Dismiss loading and show success
      dismissLoadingToast();
      showSuccess('Avatar uploaded to IPFS successfully!');
      setIsUploading(false);
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error uploading file to IPFS:', error);

      // Dismiss loading and show error
      dismissLoadingToast();
      showError('Failed to upload avatar to IPFS. Please try again.');
      setIsUploading(false);

      // Reset avatar preview on error
      setAvatar(undefined);
    }
  };

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        showError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
      }

      // Show immediate feedback that file was selected
      const fileName = file.name.length > 20
        ? file.name.substring(0, 17) + '...'
        : file.name;
      showSuccess(`Selected: ${fileName}`);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
      uploadToIPFS(file);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dismissLoadingToast();
    };
  }, [dismissLoadingToast]);

  return (
    <Field>
      <input
        type='file'
        name='avatar'
        accept='image/*'
        ref={fileInputRef}
        className='hidden'
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className='flex flex-col items-start gap-2'>
        <div className='relative'>
          <button
            onClick={handleAvatarClick}
            disabled={isUploading}
            className={`
              relative flex h-12 w-12 items-center justify-center rounded-full
              ${isUploading
                ? 'bg-gray-100 cursor-not-allowed'
                : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
              }
              text-gray-500 transition-colors
            `}
            title={isUploading ? 'Uploading to IPFS...' : 'Click to upload avatar'}
          >
            {avatar ? (
              <>
                <img
                  src={avatar.length > 100 ? avatar : avatarUrl}
                  alt='Avatar'
                  className={`h-full w-full rounded-full object-cover ${isUploading ? 'opacity-50' : ''}`}
                />
                {isUploading && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='h-8 w-8 rounded-full bg-white/90 flex items-center justify-center'>
                      <svg
                        className='h-5 w-5 animate-spin text-blue-600'
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
                    </div>
                  </div>
                )}
              </>
            ) : (
              <BsPersonPlus className={`text-2xl ${isUploading ? 'opacity-50' : ''}`} />
            )}
          </button>

          {/* Upload status indicator - pulsing dot */}
          {isUploading && (
            <div className='absolute -bottom-1 -right-1 h-3 w-3'>
              <span className='flex h-3 w-3'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 bg-blue-500'></span>
              </span>
            </div>
          )}
        </div>

        {/* Helper text when no avatar */}
        {!isUploading && !avatar && (
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Click to upload avatar
          </p>
        )}
      </div>
    </Field>
  );
};

export default UploadAvatar;
