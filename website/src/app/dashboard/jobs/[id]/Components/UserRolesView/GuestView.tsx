"use client";
import { Job, JobEventWithDiffs, JobState, User } from '@effectiveacceleration/contracts';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import JobChatsList from '../JobChatsList';
import JobChat from '../JobChat';
import JobChatDetails from '../JobChatDetails';
import { JobViewProps } from '@/service/Interfaces';

export default function GuestView({users, selectedWorker, events, job, address, addresses, sessionKeys, jobUsersData, setSelectedWorker, eventMessages, whitelistedWorkers} : JobViewProps) {
  return (
      <div className='grid grid-cols-4 min-h-customHeader'>
        <div className='p-5 col-span-1 bg-white max-h-customHeader'>
            <h1 className='font-bold'>{job.title}</h1>
            <span>{job.content}</span>
        </div>
        <div className='col-span-2 bg-white max-h-customHeader'>
          {job && <JobChat users={users} selectedWorker={selectedWorker} eventMessages={eventMessages} job={job} address={address} addresses={addresses} sessionKeys={sessionKeys} jobUsersData={jobUsersData}/>}
        </div>
        <div className='col-span-1 bg-white overflow-y-auto max-h-customHeader'>
          <JobChatDetails job={job} users={users} address={address} sessionKeys={sessionKeys} addresses={addresses} events={events} whitelistedWorkers={whitelistedWorkers}/>
        </div>
      </div>
    )
}