import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/Button'
import { renderEvent } from '@/components/Events';
import { Job, JobEventWithDiffs, JobState, User } from 'effectiveacceleration-contracts/dist/src/interfaces';
import { PostMessageButton } from '@/components/JobActions/PostMessageButton';

const JobChat = ({users, selectedWorker, events, job, address, addresses, sessionKeys} : 
{
    users: Record<string, User>, 
    selectedWorker: string, 
    events: JobEventWithDiffs[],    
    job: Job, 
    address: `0x${string}` | undefined,
    sessionKeys: Record<string, string>,
    addresses: string[]  
}) => {
  return (
    <>
        <div className='h-[8.5%]'>
            <div className='flex flex-1 border border-gray-100 p-4 justify-between align-center'>
                <div className='flex  h-fit'>
                    <div className='flex flex-row'> 
                        <div className='flex self-center pr-4'>
                            <Image className='max-h-10 max-w-10 rounded-lg' src={users[selectedWorker]?.avatar || '/profilePicture.webp'} height={100} width={100} alt={'Profile picture'}/> 
                        </div>
                        <div className='self-center'>
                                <span className='font-extrabold block'>
                                    {users[selectedWorker]?.name || 'Global Events'}
                                </span>
                                {/* <span className='text-primary font-semibold text-sm block'>
                                    Fixed rate: $45
                                </span> */}
                        </div>
                    </div>
                </div>
                {/* <div className='flex'>
                    <Button color={'cancelBorder'} className={'w-full'}>Reject</Button>
                </div> */}
            </div>
        </div>
        {/* <div className='flex flex-[2] border border-gray-100 flex-col text-center justify-evenly p-2 h-[20%]'>
            <p className='flex text-sm self-center text-darkBlueFont'>You can dismiss {users[selectedWorker]?.name || 'worker'} or select them for the job.</p>
            <p className='flex text-sm self-center text-darkBlueFont'>- Dismissing a candidate worker will hide the worker from the list and you will no longer be notified about new messages from them.</p>
            <p className='flex text-sm self-center text-darkBlueFont'>- Selecting the candidate will set only this worker in the whitelist, preventing other candidates from messaging you, so you can focus on hammering out the details with the selected worker Read Less...</p>
        </div> */}
        <div className='flex flex-[6] border border-gray-100 bg-softBlue h-[82.5%] pl-5'>
            <div className="flow-root overflow-y-auto w-full">
            <ul role="list" className="-mb-8">
                {events?.slice().map((event, index) => (
                <li key={index}>
                    <div className="relative pb-8">
                    {index !== events?.length - 1 ? (
                        <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                        {renderEvent({event})}
                    </div>
                    </div>
                </li>
                ))}
            </ul>
            </div>
        </div>
        {job && <>
        {job.state !== JobState.Closed && address !== job.roles.arbitrator && addresses.length && Object.keys(sessionKeys).length > 0 &&
            <div className='flex flex-1 border border-gray-100 h-[9%]'>
                <PostMessageButton address={address} addresses={addresses as any} sessionKeys={sessionKeys} job={job}/>
            </div>
        }
        </>
        }
    </>
  )
}

export default JobChat