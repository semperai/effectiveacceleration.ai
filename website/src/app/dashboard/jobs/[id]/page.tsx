"use client";

import { Layout } from '@/components/Dashboard/Layout'
import { Text } from '@/components/Text'
import { useParams } from 'next/navigation';
import useJobEventsWithDiffs from '@/hooks/useJobEventsWithDiffs';
import useJob from '@/hooks/useJob';
import { useAccount } from 'wagmi';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import { SetStateAction, useEffect, useState } from 'react';
import useUser from '@/hooks/useUser';
import OwnerView from './Components/UserRolesView/OwnerView';
import ArbitratorView from './Components/UserRolesView/ArbitratorView';
import GuestView from './Components/UserRolesView/GuestView';
import WorkerView from './Components/UserRolesView/WorkerView';
import { zeroAddress } from 'viem';
import { JobUserRoles } from '@/service/Interfaces';

export default function JobPage() {
  const id = useParams().id as string;
  const jobId = BigInt(id);
  const { address } = useAccount();
  const { data: job, isLoadingError, ...rest } = useJob(jobId);
  const { data: events, addresses, arbitratorAddresses, sessionKeys } = useJobEventsWithDiffs(jobId);
  const { data: users } = useUsersByAddresses(addresses);
  const { data: jobUsersData } = useUsersByAddresses([address!, job?.roles.creator!, job?.roles.worker!, job?.roles.arbitrator!]);
  const whitelistedWorkers = events.at(-1)?.job.allowedWorkers ?? [];
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [eventMessages, setEventMessages] = useState(events);

  useEffect(() => {
    if (selectedWorker === 'allEvents') {
      setEventMessages(events) 
      return
    };
    selectedWorker ? 
    setEventMessages(events.filter(event => event.address_ === selectedWorker.toLowerCase())) 
    : setEventMessages(events);
    if (job && job.roles.worker !== zeroAddress) setSelectedWorker(job.roles.worker[0]);
  }, [events, selectedWorker])

  if (isLoadingError) {
    return (
      <div className='mt-5'>
        <Layout>
          <Text>
            Job not found
          </Text>
        </Layout>
      </div>
    )
  } else if (!job) {
    return (
      <Layout>
          <></>
      </Layout>
    )
  }

  const renderRoleBasedView = () => {
    if (address && job?.roles.creator.includes(address)) {
      return <OwnerView users={users} job={job} setSelectedWorker={setSelectedWorker} events={eventMessages} address={address} addresses={addresses} sessionKeys={sessionKeys} jobUsersData={jobUsersData} whitelistedWorkers={whitelistedWorkers} selectedWorker={selectedWorker} eventMessages={eventMessages} ></OwnerView>
    } else if (address && job?.roles.worker.includes(address)) {
      return <WorkerView users={users} job={job} setSelectedWorker={setSelectedWorker} events={eventMessages} address={address} addresses={addresses} sessionKeys={sessionKeys} jobUsersData={jobUsersData} whitelistedWorkers={whitelistedWorkers} selectedWorker={selectedWorker} eventMessages={eventMessages} ></WorkerView>
    } else if (address && job?.roles.arbitrator.includes(address)) {
      return <ArbitratorView users={users} job={job} setSelectedWorker={setSelectedWorker} events={eventMessages} address={address} addresses={addresses} sessionKeys={sessionKeys} jobUsersData={jobUsersData} whitelistedWorkers={whitelistedWorkers} selectedWorker={selectedWorker} eventMessages={eventMessages} ></ArbitratorView>
    } else {
      return <GuestView users={users} job={job} setSelectedWorker={setSelectedWorker} events={eventMessages} address={address} addresses={addresses} sessionKeys={sessionKeys} jobUsersData={jobUsersData} whitelistedWorkers={whitelistedWorkers} selectedWorker={selectedWorker} eventMessages={eventMessages} ></GuestView>
    }
  } 

  return (
    <Layout borderless> 
      <div className='grid grid-cols-1 min-h-customHeader'>
        {renderRoleBasedView()}
      </div>
    </Layout>
  )
}
