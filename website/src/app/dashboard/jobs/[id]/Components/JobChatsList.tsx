import React, { Dispatch, SetStateAction } from 'react'
import Image from 'next/image'
import { Job } from 'effectiveacceleration-contracts'
import { User } from 'effectiveacceleration-contracts/dist/src/interfaces';

const JobChatsList = ({users, job, setSelectedWorker} : {users: Record<string, User>, job: Job | undefined, setSelectedWorker:Dispatch<SetStateAction<string>> }) => {
  const numberOfWorkers = (Object.keys(users).length) - 1  // -1 to exclude the creator;
  return (
    <div>
        <div>
            <span className='font-bold'>Chats</span>    
        </div>
        {numberOfWorkers === 0 ? (
            <div>
                <span className='text-darkBlueFont text-sm'>There are no applicants yet</span>  
            </div>
        ) : (
        <div>
            <span className='text-darkBlueFont text-sm'>{numberOfWorkers}/{numberOfWorkers} applicants reviewed</span>  
        </div>
        )
        }

        <ul>
            {  Object.entries(users).map(([key, value]) => (
                job?.roles.creator !== key ?
                    <li key={key} className='flex flex-row py-2 hover:bg-slate-100 cursor-pointer rounded' onClick={() => setSelectedWorker(key)}>
                        <Image className='flex flex-1 items-center mr-2 max-h-10 max-w-10 rounded-lg' src={`${value.avatar ? value.avatar : '/profilePicture.webp'}`} height={100} width={100} alt={'Profile picture'}></Image>
                        <div className='flex flex-col flex-[4] items-left'>
                            <span >{value.name}</span>
                            <p className='text-sm text-darkBlueFont truncate ... max-w-56 '>{value.bio ? value.bio : 'Unregistered Account'}</p>
                        </div>
                        <div className='flex flex-1'>
                                {/* {applicant.lastMessageHour} */}
                        </div>
                    </li>
                : null
            ))}
        </ul>
    </div>
  )
}

export default JobChatsList