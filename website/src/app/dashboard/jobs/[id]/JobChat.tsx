import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/Button'
import { renderEvent } from '@/components/Events';
import { Job, JobEventType, JobEventWithDiffs, JobState, User } from 'effectiveacceleration-contracts/dist/src/interfaces';
import { PostMessageButton } from '@/components/JobActions/PostMessageButton';
import Link from 'next/link';
import { title } from 'process';
import { zeroAddress, zeroHash } from 'viem';
import { DisputeButton } from '@/components/JobActions/DisputeButton';
import { ApproveButton } from '@/components/JobActions/ApproveButton';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';

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
    console.log(events)
  return (
    <div className='grid grid-rows-[74px_70%_10%] max-h-customHeader'>
        <div className='min-h-[100px]'>
            <div className='border border-gray-100 p-4 justify-between align-center'>
                <div className='h-fit'>
                    <div className='flex flex-row'> 
                        <div className='flex self-center pr-4'>
                            <Image className='max-h-10 max-w-10 rounded-lg' src={users[selectedWorker]?.avatar || '/profilePicture.webp'} height={100} width={100} alt={'Profile picture'}/> 
                        </div>
                        <div className='self-center'>
                                <span className='font-extrabold block'>
                                    {users[selectedWorker]?.name}
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
        <div className='row-span-4 border border-gray-100 bg-softBlue pl-5 max-h-customHeader overflow-y-auto'>
            <div className="flow-root w-full">
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
            {events[events.length - 1]?.type_ === JobEventType.Completed &&
            <div className="py-16 w-full content-center text-center">
                <span className='text-primary justify-center block pb-2'>{users[selectedWorker]?.name || 'user'} has completed the job with a comment: 
                    {events.filter(event => event.type_ === JobEventType.Delivered)[0].job.result}
                </span>
                <span className='block'>You have accepted the result.</span>
                <div className='pt-3'>
                <Link href={{
                        pathname: '/dashboard/post-job',
                        query: { title: job.title, content: job.content, token: job.token, maxTime: job.maxTime, deliveryMethod: job.deliveryMethod, arbitrator: job.roles.arbitrator, tags: job.tags}
                        }}>
                        <Button color='purplePrimary'>Create a new job with {'user'}</Button>
                </Link>

                </div>
            </div>
            }

            {job.state === JobState.Taken && job.resultHash !== zeroHash && address === job.roles.creator && job &&// Delivered State
            <div className="py-16 w-full content-center text-center">
                <span className='text-primary justify-center block pb-2'>{users[selectedWorker]?.name || 'user'} has completed the job with a comment: 
                    {events.filter(event => event.type_ === JobEventType.Delivered)[0]?.job.result}
                </span>
                <span className='block font-semibold'>To confirm the result or request a refund, click buttons below. </span>
                <span className='block font-semibold'>To ask Rebecca for changes, simply send them a message</span>
                <div className='pt-3'>
                <div className='flex justify-center gap-x-4'>
                    {job.state === JobState.Taken && job.resultHash !== zeroHash && address === job.roles.creator &&
                    <div className='max-w-46'>
                        <ApproveButton address={address} job={job}></ApproveButton>
                    </div>
                    }
                </div>

                </div>
            </div>
            }
            {job.state === JobState.Open && address === job.roles.creator && events.length > 0 && //Start job state
                <div className="py-16 w-full content-center flex flex-col justify-center items-center">
                    <span className='block font-semibold mb-4'>You will have a chance to review the job parameters before confirming  </span>
                    <div className='max-w-56 flex justify-center'>
                        <AssignWorkerButton address={address} job={job}></AssignWorkerButton>
                    </div>  
                </div>
            }

            {job.state === JobState.Taken && job.resultHash === zeroHash && address === job.roles.creator && events.length > 0 && //Started job state
            <div className='my-3'>
            <div className='w-full h-[1px] bg-gray-200'></div>
            <div className="py-6 w-full content-center text-center">
                <span className='block font-medium text-primary'>You have accepted USER to start the job.</span>
            </div>
            <div className='w-full h-[1px] bg-gray-200'></div>
            </div>
            }
        </div>
        {job && <>
        {job.state !== JobState.Closed && address !== job.roles.arbitrator && addresses.length && Object.keys(sessionKeys).length > 0 &&
            <div className='row-span-1 flex flex-1 border border-gray-100'>
                <PostMessageButton address={address} addresses={addresses as any} sessionKeys={sessionKeys} job={job}/>
            </div>
        }
        </>
        }
    </div>
  )
}

export default JobChat