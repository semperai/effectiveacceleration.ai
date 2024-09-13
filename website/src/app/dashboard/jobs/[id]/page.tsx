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
import { SetStateAction, useEffect, useState } from 'react';
import JobChatsList from './JobChatsList';
import JobChat from './JobChat';
import JobChatDetails from './JobChatDetails';
import JobButtonActions from './JobButtonActions';

export default function JobPage() {
  const id = useParams().id as string;
  const jobId = BigInt(id);
  const { address } = useAccount();
  const { data: job, isLoadingError, ...rest } = useJob(jobId);
  const { data: events, addresses, arbitratorAddresses, sessionKeys } = useJobEventsWithDiffs(jobId);
  const { data: users } = useUsersByAddresses(addresses);
  const whitelistedWorkers = events.at(-1)?.job.allowedWorkers ?? [];
  const [selectedWorker, setSelectedWorker] = useState<string>('allEvents');
  const [eventMessages, setEventMessages] = useState(events);
  
  useEffect(() => {
    if (selectedWorker === 'allEvents') {
      setEventMessages(events) 
      return
    };
    selectedWorker ? 
    setEventMessages(events.filter(event => event.address_ === selectedWorker.toLowerCase())) 
    : setEventMessages(events);
  }, [events, selectedWorker])

  return isLoadingError ? <div className="mt-5">
    <Layout>
      <Text>
        Job not found
      </Text>
    </Layout>
    </div> :
    <Layout borderless> 
      <div className='grid grid-cols-4 min-h-customHeader'>
        {job?.state === JobState.Open ? 
          <div className='col-span-1 bg-white p-3 border border-gray-100 max-h-customHeader overflow-y-auto'>
            <JobChatsList users={users} job={job} setSelectedWorker={setSelectedWorker}/>
          </div> 
          : 
          ''
        }
        <div className={`${job?.state === JobState.Open ? 'col-span-2' : 'col-span-3' } bg-white max-h-customHeader`}>
          {job && <JobChat users={users} selectedWorker={selectedWorker} events={eventMessages} job={job} address={address} addresses={addresses} sessionKeys={sessionKeys}/>}
        </div>
        <div className='col-span-1 bg-white overflow-y-auto max-h-customHeader'>
          <JobChatDetails job={job} users={users} address={address} sessionKeys={sessionKeys} addresses={addresses} events={events} whitelistedWorkers={whitelistedWorkers}/>
        </div>
      </div>
      {/* <JobButtonActions job={job} address={address} sessionKeys={sessionKeys} addresses={addresses} events={events} whitelistedWorkers={whitelistedWorkers}/> */}
    </Layout>
}
