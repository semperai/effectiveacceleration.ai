'use client';
import {
  Job,
  JobEventWithDiffs,
  JobState,
  User,
} from '@effectiveacceleration/contracts';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import JobChatsList from '../JobChatsList';
import JobChat from '../JobChat';
import JobChatDetails from '../JobChatDetails';
import { JobViewProps } from '@/service/Interfaces';

export default function WorkerView({
  users,
  selectedWorker,
  events,
  job,
  address,
  addresses,
  sessionKeys,
  jobUsersData,
  setSelectedWorker,
  eventMessages,
  whitelistedWorkers,
}: JobViewProps) {
  return (
    <div className='grid min-h-customHeader grid-cols-4'>
      <div className='col-span-1 max-h-customHeader bg-white p-5'>
        <h1>{job.title}</h1>
        <span>{job.content}</span>
      </div>
      <div className={`col-span-2 max-h-customHeader bg-white`}>
        {job && (
          <JobChat
            users={users}
            selectedWorker={selectedWorker}
            eventMessages={eventMessages}
            job={job}
            address={address}
            addresses={addresses}
            sessionKeys={sessionKeys}
            jobUsersData={jobUsersData}
          />
        )}
      </div>
      <div className='col-span-1 max-h-customHeader overflow-y-auto bg-white'>
        <JobChatDetails
          job={job}
          users={users}
          address={address}
          sessionKeys={sessionKeys}
          addresses={addresses}
          events={events}
          whitelistedWorkers={whitelistedWorkers}
        />
      </div>
    </div>
  );
}
