'use client'
import { Button } from '@/components/Button'
import { Field, FieldGroup, Label } from '@/components/Fieldset'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { BsPersonPlus } from "react-icons/bs";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { MARKETPLACE_DATA_V1_ABI } from "@effectiveacceleration/contracts/wagmi/MarketplaceDataV1";
import Config from "@effectiveacceleration/contracts/scripts/config.json";
import { useSearchParams } from 'next/navigation'
import { UserButton } from '@/components/UserActions/UserButton'
import useUser from '@/hooks/useUser'
import { useRouter } from 'next/navigation';
import UploadAvatar from '@/components/UploadAvatar'
import { PostJobParams } from '../dashboard/post-job/PostJobPage'


const ipfsGatewayUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ?? '';

const CreateProfile = ({encryptionPublicKey} : {encryptionPublicKey: `0x${string}`}) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [avatar, setAvatar] = useState<string | undefined>('')
    const [avatarFileUrl, setAvatarFileUrl] = useState<string | undefined>('');
    const [userName, setName] = useState<string>('') 
    const [userBio, setBio] = useState<string>('')
    const { address } = useAccount();
    const {data: user} = useUser(address!);
    const userCopy = {...user}
    const router = useRouter();
    const unregisteredUserLabel = `${address}-unregistered-job-cache`
   
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
          const jobsAfterSignUp = JSON.parse(sessionStorage.getItem(unregisteredUserLabel) || '[]')
          const savedJob: PostJobParams = jobsAfterSignUp[0]
          userCopy.address_ = address;
          userCopy.publicKey = encryptionPublicKey;
          userCopy.name = userName;
          userCopy.bio = userBio;
          userCopy.avatar = avatarFileUrl;
          sessionStorage.setItem(`user-${address}`, JSON.stringify(userCopy));
          // If savedJob.title exist then this unregistered user is comming from posting a job
          if (savedJob?.title) {
            router.push('/dashboard/post-job'); 
            return
          }
          router.push('/dashboard');
        }
      }
    }, [isConfirmed, error]);

    const submit = () => {
      if (avatarFileUrl === undefined) return
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
  
    console.log(avatarFileUrl, 'FILE URL')
  return (
    <div className='flex flex-row self-center shadow-xl'>
        <Image className='rounded-l-md z-10' src={'/registerImage.jpg'} height={50} width={350} alt={''}></Image>
        <div className='w-full max-w-md transform overflow-hidden rounded-l-none rounded-md bg-white p-6 text-left align-middle transition-all flex justify-center flex-col self-center gap-y-2'>
            <h1 className='text-xl font-extrabold'>Create a Profile</h1>
            <FieldGroup className='flex-1 my-2'>
                <span className='mb-4'>Add an avatar to stand out from the crowd</span> 
                <UploadAvatar avatar={avatar} setAvatar={setAvatar} setAvatarFileUrl={setAvatarFileUrl}/>
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