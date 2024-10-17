"use client";
import { Job, JobEventWithDiffs, JobState, User } from 'effectiveacceleration-contracts';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import JobChatsList from '../JobChatsList';
import JobChat from '../JobChat';
import JobChatDetails from '../JobChatDetails';
import { JobViewProps } from '@/service/Interfaces';

export default function OwnerView({users, selectedWorker, events, job, address, addresses, sessionKeys, jobUsersData, setSelectedWorker, eventMessages, whitelistedWorkers} : JobViewProps) {
  return (
      <div className='grid grid-cols-4 min-h-customHeader'>
        {job?.state === JobState.Open && address === job.roles.creator  ? 
          <div className='col-span-1 bg-white p-3 border border-gray-100 max-h-customHeader overflow-y-auto'>
            <JobChatsList users={users} job={job} setSelectedWorker={setSelectedWorker} />
          </div> 
          : 
          ''
        }
        <div className={`${job?.state === JobState.Open && address === job.roles.creator ? 'col-span-2' : 'col-span-3' } bg-white max-h-customHeader`}>
          {job && <JobChat users={users} selectedWorker={selectedWorker} eventMessages={eventMessages} job={job} address={address} addresses={addresses} sessionKeys={sessionKeys} jobUsersData={jobUsersData}/>}
        </div>
        <div className='col-span-1 bg-white overflow-y-auto max-h-customHeader'>
          <JobChatDetails job={job} users={users} address={address} sessionKeys={sessionKeys} addresses={addresses} events={events} whitelistedWorkers={whitelistedWorkers}/>
        </div>
      </div>
    )
}