"use client";

import { Layout } from '@/components/Dashboard/Layout'
import { Link } from '@/components/Link'
import { Button } from '@/components/Button'
import { Text } from '@/components/Text'
import Image from 'next/image';
import {
  CalendarIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  LinkIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/20/solid'
import { useParams } from 'next/navigation';
import moment from 'moment';
import { renderEvent } from '@/components/Events';
import useJobEventsWithDiffs from '@/hooks/useJobEventsWithDiffs';
import { zeroAddress, zeroHash } from 'viem';
import useJob from '@/hooks/useJob';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens'
import { JobState } from 'effectiveacceleration-contracts';
import { useAccount } from 'wagmi';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import { AcceptButton } from '@/components/JobActions/AcceptButton';
import { DeliverResultButton } from '@/components/JobActions/DeliverResultButton';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';
import { PostMessageButton } from '@/components/JobActions/PostMessageButton';
import { ArbitrateButton } from '@/components/JobActions/ArbitrateButton';
import { RefuseArbitrationButton } from '@/components/JobActions/RefuseArbitrationButton';
import { ApproveButton } from '@/components/JobActions/ApproveButton';
import { ReviewButton } from '@/components/JobActions/ReviewButton';
import { CloseButton } from '@/components/JobActions/CloseButton';
import { ReopenButton } from '@/components/JobActions/ReopenButton';
import { RefundButton } from '@/components/JobActions/RefundButton';
import { DisputeButton } from '@/components/JobActions/DisputeButton';
import { WithdrawCollateralButton } from '@/components/JobActions/WithdrawCollateralButton';
import { WhitelistButton } from '@/components/JobActions/WhitelistButton';
import { RemoveFromWhitelistButton } from '@/components/JobActions/RemoveFromWhitelistButton';
import { UpdateButton } from '@/components/JobActions/UpdateButton';
import LinearProgress from '@mui/material/LinearProgress';
import useShortenText from '@/hooks/useShortenText';
import jobs from '../../job/applicants/[id]/dummyData';
import clsx from 'clsx';
import { IoIosClose } from 'react-icons/io';
import { useState } from 'react';

export default function JobPage() {
  const id = useParams().id as string;
  const jobId = BigInt(id);
  const { address } = useAccount();
  const { data: job, isLoadingError, ...rest } = useJob(jobId);

  const { data: events, addresses, arbitratorAddresses, sessionKeys } = useJobEventsWithDiffs(jobId);
  const { data: users } = useUsersByAddresses(addresses);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  console.log(users['0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'])
  const whitelistedWorkers = events.at(-1)?.job.allowedWorkers ?? [];
  const eventMessages = events.filter(event => event.type_ === 17 || event.type_ === 18);


  return isLoadingError ? <div className="mt-5">
      <Text>
        Job not found
      </Text>
    </div> :
    <Layout borderless> 
    <div className='flex flex-row min-h-customHeader'>
        <div className='flex flex-1 flex-col bg-white p-3 border border-gray-100 max-h-customHeader overflow-y-auto'>
            <div>
                <span className='font-bold'>Chats</span>    
            </div>
            <div>
                <span className='text-darkBlueFont text-sm'>2/16 applicants reviewed</span>  
            </div>
                {  Object.entries(users).map(([key, value]) => (
                  job?.roles.creator !== key ?
                      <div key={key} className='flex flex-row py-2 hover:bg-slate-100 cursor-pointer rounded' onClick={() => setSelectedWorker(key)}>
                        <div className='flex flex-1 items-center mr-2'>
                            <Image className='max-h-10 max-w-10 rounded-lg' src={value.avatar} height={100} width={100} alt={'Profile picture'}></Image>
                        </div>
                        <div className='flex flex-col flex-[4] items-left'>
                            <div><span >{value.name}</span></div>
                            <div><p className='text-sm text-darkBlueFont truncate ... max-w-52 '>{value.bio}</p></div>
                        </div>
                        <div className='flex flex-1'>
                                {/* {applicant.lastMessageHour} */}
                        </div>
                    </div>
                    : null
                ))}

        </div>
        <div className='flex flex-[2] flex-col bg-white  max-h-customHeader '>
            <div className='h-fit'>
                <div className='flex flex-1 border border-gray-100 p-4 justify-between align-center'>
                    <div className='flex  h-fit'>
                        <div className='flex flex-row'> 
                            <div className='flex self-center pr-4'>
                                <Image className='max-h-10 max-w-10 rounded-lg' src={users[selectedWorker]?.avatar} height={100} width={100} alt={'Profile picture'}/> 
                            </div>
                            <div className='self-center'>
                                    <span className='font-extrabold block'>
                                      {users[selectedWorker]?.name || 'User'}
                                    </span>
                                    <span className='text-primary font-semibold text-sm block'>
                                        Fixed rate: $45
                                    </span>
                            </div>
                        </div>
                    </div>
                    <div className='flex'>
                        <Button color={'cancelBorder'} className={'w-full'}>Reject</Button>
                    </div>
                </div>
            </div>
            <div className='flex flex-[2] border border-gray-100 flex-col text-center justify-evenly p-2 h-[20%]'>
                <p className='flex text-sm self-center text-darkBlueFont'>You can dismiss Rebecca Blake or select them for the job.</p>
                <p className='flex text-sm self-center text-darkBlueFont'>- Dismissing a candidate worker will hide the worker from the list and you will no longer be notified about new messages from them.</p>
                <p className='flex text-sm self-center text-darkBlueFont'>- Selecting the candidate will set only this worker in the whitelist, preventing other candidates from messaging you, so you can focus on hammering out the details with the selected worker Read Less...</p>
            </div>
            <div className='flex flex-[6] border border-gray-100 bg-softBlue h-[60%] '>
              <div className="flow-root overflow-y-auto max-w-[800px]">
                <ul role="list" className="-mb-8">
                  {events?.slice().reverse().map((event, index) => (
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
            <div className='flex flex-1 border border-gray-100 h-[10%]'>Chat Input</div>
        </div>
        <div className='flex flex-1 bg-white flex-col overflow-y-auto max-h-customHeader'>
            <div className='py-5 px-8  text-center bg-[#FF7B02] bg-opacity-10'>
                <span className='font-bold text-[#FF7A00]'>Awaiting Job Acceptance</span> 
            </div>
            <div className='p-4 border border-gray-100'>
                <div>
                    <span className='font-bold'>{ job?.title }</span>    
                </div>
                <div className='my-2 mb-4'>
                    <span className='text-sm mb-2'>{ job?.content }</span>
                </div>
                <div>  
                    <div className='flex-col justify-center'>
                        <div className='mb-1'>
                            <Button color={'borderlessGray'}  className='w-full'>Edit Details</Button>  
                        </div>
                        <div className='mb-1'>
                            <Button color={'borderlessGrayCancel'}  className='w-full'>Cancel Job</Button>   
                        </div>
                        <div>
                          <Button color={'borderlessGray'} className={'w-full'}>
                            <LinkIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-primary" aria-hidden="true" />
                              Share
                          </Button>
                        </div>
                    </div> 
                </div>
            </div>
            <div className='p-4 border border-gray-100'>
                <div>
                    <span className='font-bold'>Project Details</span>    
                </div>
                <div className='flex justify-between my-2'>
                    <span>Price</span>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <CurrencyDollarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" aria-hidden="true" />
                      {job && (
                        <div className='flex flex-row items-center gap-2'>
                          {formatTokenNameAndAmount(job.token, job.amount)}
                          <img src={tokenIcon(job.token)} alt="" className="flex-none w-4 h-4 mr-1" />
                        </div>
                      )}
                    </div>
                </div>
                <div className='flex justify-between my-2'>
                    <span>Multiple Applicants</span>
                    {job?.multipleApplicants ? 
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 ">
                      allowed
                    </div> : 
                    <span>
                    Not Allowed
                    </span>}
                  </div>
                <div className='flex justify-between my-2'>
                    <span>Delivery Method</span>
                    <span>{job?.deliveryMethod}</span>
                </div>
                <div className='flex justify-between my-2'>
                  <UserIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" aria-hidden="true" />
                  last updated by { users[job?.roles.creator!]?.name } { moment(job?.timestamp! * 1000).fromNow() }
                </div>
            </div>
            <div className='p-4 border border-gray-100'>
                <div className='flex justify-between my-2'>
                    <span className='font-bold'>Delivery Time</span>  
                    { moment.duration(job?.maxTime, "seconds").humanize() } 
                </div>
                <div className='my-2'>
                  <LinearProgress
                    value={50}
                    variant="determinate"
                  />
                </div>
                <div className='flex my-2'>

                </div>
            </div>
            <div className='p-4 border border-gray-100'>
                <div>
                    <span className='font-bold'>Addresses</span>    
                </div>
                <div className='flex justify-between my-2'>
                    <span>Arbitrator Address</span>
                    <span>{useShortenText({text: job?.roles.arbitrator ,maxLength: 12}) || ''}</span>
                </div>
                <div className='flex justify-between my-2'>
                {(whitelistedWorkers.length ?? 0) > 0 && <div className="mt-1">
                    <Text>
                      Whitelisted for {
                        whitelistedWorkers.map((address) => (
                          <a key={address} href={`/dashboard/users/${address}`} className="font-medium text-gray-900 dark:text-gray-100">
                            {users[address]?.name ?? address}
                          </a>
                        ))}
                    </Text>
                </div>}
                </div>
            </div>
            <div className='p-4 border border-gray-100'>
                <div>
                    <span className='font-bold'>Tags</span>    
                </div>
                <div className='my-2'>
                  {job?.tags.map((value) => (
                    <div
                      key={value}
                      className={clsx("bg-softBlue text-white px-3 py-1 pb-2 m-1 rounded-full inline ")}
                    >
                      <span className='text-darkBlueFont text-md font-medium inline'>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
            </div>
        </div>
    </div>
      <div className="max-h-0">
        {job && <div className="flex">
          {/* owner & worker actions */}
          {job.state !== JobState.Closed && address !== job.roles.arbitrator && addresses.length && Object.keys(sessionKeys).length > 0 &&
            <PostMessageButton address={address} addresses={addresses as any} sessionKeys={sessionKeys} job={job}></PostMessageButton>
          }
          {job.state === JobState.Taken && job.resultHash !== zeroHash && job.roles.arbitrator !== zeroAddress && address !== job.roles.arbitrator && addresses.length && Object.keys(sessionKeys).length > 0 &&
            <DisputeButton address={address} sessionKeys={sessionKeys} job={job}></DisputeButton>
          }

          {/* owner actions */}
          {job.state === JobState.Open && address === job.roles.creator && events.length > 0 &&
            <AssignWorkerButton address={address} job={job}></AssignWorkerButton>
          }
          {job.state === JobState.Taken && job.resultHash !== zeroHash && address === job.roles.creator &&
            <ApproveButton address={address} job={job}></ApproveButton>
          }
          {job.state === JobState.Closed && job.rating === 0 && job.resultHash !== zeroHash && address === job.roles.creator &&
            <ReviewButton address={address} job={job}></ReviewButton>
          }
          {job.state === JobState.Open && address === job.roles.creator &&
            <CloseButton address={address} job={job}></CloseButton>
          }
          {job.state === JobState.Closed && address === job.roles.creator && job.resultHash === zeroHash &&
            <ReopenButton address={address} job={job}></ReopenButton>
          }
          {job.state === JobState.Closed && address === job.roles.creator && job.collateralOwed > 0n &&
            <WithdrawCollateralButton address={address} job={job}></WithdrawCollateralButton>
          }
          {job.state === JobState.Open && address === job.roles.creator && job.whitelistWorkers &&
            <WhitelistButton address={address} job={job} whitelist={whitelistedWorkers}></WhitelistButton>
          }
          {job.state === JobState.Open && address === job.roles.creator && job.whitelistWorkers && events.length > 0 && events.at(-1)!.job.allowedWorkers!.length! > 0 &&
            <RemoveFromWhitelistButton address={address} job={job} whitelist={whitelistedWorkers}></RemoveFromWhitelistButton>
          }
          {job.state === JobState.Open && address === job.roles.creator &&
            <UpdateButton address={address} job={job}></UpdateButton>
          }

          {/* worker actions */}
          {job.state === JobState.Taken && address === job.roles.worker &&
            <RefundButton address={address} job={job}></RefundButton>
          }
          {job.state === JobState.Open && address === job.roles.worker && events.length > 0 &&
            <AcceptButton address={address} job={job} events={events}></AcceptButton>
          }
          {job.state === JobState.Taken && address === job.roles.worker && Object.keys(sessionKeys).length > 0 &&
            <DeliverResultButton address={address} job={job} sessionKeys={sessionKeys}></DeliverResultButton>
          }

          {/* arbitrator actions */}
          {job.state === JobState.Taken && address === job.roles.arbitrator &&
            <ArbitrateButton address={address} job={job} sessionKeys={sessionKeys}></ArbitrateButton>
          }
          {job.state !== JobState.Closed && address === job.roles.arbitrator &&
            <RefuseArbitrationButton job={job}></RefuseArbitrationButton>
          }
        </div>
        }
      </div>
    </Layout>
}
