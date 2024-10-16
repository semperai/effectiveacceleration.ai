'use client'
import { Button } from '@/components/Button'
import { Field, FieldGroup, Label } from '@/components/Fieldset'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { BsPersonPlus } from "react-icons/bs";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { MARKETPLACE_DATA_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useSearchParams } from 'next/navigation'
import { UserButton } from '@/components/UserActions/UserButton'
import useUser from '@/hooks/useUser'
import { useRouter } from 'next/navigation';


const ipfsGatewayUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ?? '';

// const helia = await createHelia({ url: 'http://localhost:5001' })

const CreateProfile = ({encryptionPublicKey} : {encryptionPublicKey: `0x${string}`}) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [avatar, setAvatar] = useState<string>('')
    const [userName, setName] = useState<string>('') 
    const [userBio, setBio] = useState<string>('')
    const { address } = useAccount();
    const {data: user} = useUser(address!);
    const [avatarFileUrl, setAvatarFileUrl] = useState<string>('');
    const router = useRouter();
    const {
      data: hash,
      error,
      writeContract,
    } = useWriteContract();

    const {
      isLoading: isConfirming,
      isSuccess: isConfirmed,
    } = useWaitForTransactionReceipt({
      hash
    });

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

    useEffect(() => {
      if (isConfirmed || error) {
        if (error) {
          const revertReason = error.message.match(`The contract function ".*" reverted with the following reason:\n(.*)\n.*`)?.[1];
          if (revertReason) {
            alert(error.message.match(`The contract function ".*" reverted with the following reason:\n(.*)\n.*`)?.[1])
          } else {
            console.log(error, error.message);
            alert("Unknown error occurred");
          }
        }
        if (isConfirmed) {
          router.push('/dashboard');
        }
      }
    }, [isConfirmed, error]);

    useEffect(() => {
      console.log(user, address, 'User and its Address')
    }, [user]);

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


    const submit = () => {
      console.log(encryptionPublicKey, userName, userBio, avatarFileUrl)
      try {
        const w = writeContract({
          abi: MARKETPLACE_DATA_V1_ABI,
          address: Config.marketplaceDataAddress as `0x${string}`,
          functionName: 'registerUser',
          args: [
            encryptionPublicKey as `0x${string}`,
            userName, 
            userBio, 
            avatarFileUrl
          ],
          
        });
      } catch (error) {
        console.error('Error writing contract: ', error);
      }
    }
  

  return (
    <div className='flex flex-row self-center shadow-xl'>
        <Image className='rounded-l-md z-10' src={'/registerImage.jpg'} height={50} width={350} alt={''}></Image>
        <div className='w-full max-w-md transform overflow-hidden rounded-l-none rounded-md bg-white p-6 text-left align-middle transition-all flex justify-center flex-col self-center gap-y-2'>
            <h1 className='text-xl font-extrabold'>Create a Profile</h1>
            <FieldGroup className='flex-1 my-2'> 
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
                <Field>
                <Label>Your Name</Label>
                <Input
                    name="name"
                    value={userName}
                    placeholder='Name'
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />
                {/* {titleError && <div className='text-xs' style={{ color: 'red' }}>{titleError}</div>} */}
                </Field>
                <Field>
                <Label>About Yourself</Label>
                <Textarea
                    name="title"
                    value={userBio}
                    placeholder='About Yourself'
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                />
                {/* {titleError && <div className='text-xs' style={{ color: 'red' }}>{titleError}</div>} */}
                </Field>
            </FieldGroup> 
            <span className='text-sm text-primary'>* Name and avatar cannot be changed once your profile is created</span>
            <Button onClick={submit}>Create Profile</Button>
        </div>
    </div>
  )
}

export default CreateProfile