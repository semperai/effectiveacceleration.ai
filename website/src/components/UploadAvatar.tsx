import React, { useRef, useState } from 'react'
import { Field } from './Fieldset';
import { BsPersonPlus } from 'react-icons/bs';

const ipfsGatewayUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ?? '';

const UploadAvatar = ({avatar, setAvatar, setAvatarFileUrl} : {avatar: string, setAvatar: React.Dispatch<React.SetStateAction<string>>, setAvatarFileUrl: React.Dispatch<React.SetStateAction<string>>,}) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const uploadToIPFS = async (file: File): Promise<void> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

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
        console.log('File uploaded to IPFS:', url);
    } catch (error) {
        console.error('Error uploading file to IPFS:', error);
    }
    };

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
          fileInputRef.current.click()
        }
      }
  
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
            setAvatar(reader.result as string)
            }
            reader.readAsDataURL(file)

            uploadToIPFS(file);
        }
    }
  return (
    <Field>
        <span className='mb-4'>Add an avatar to stand out from the crowd</span>
        <input
            type="file"
            name="avatar"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
        />
        <button
            onClick={handleAvatarClick}
            className="flex items-center justify-center w-12 h-12 text-gray-500 bg-gray-200 rounded-full hover:bg-gray-300 mt-4"
        >
            {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
                <BsPersonPlus className='text-2xl' />
            )}
        </button>
    </Field>
  )
}

export default UploadAvatar