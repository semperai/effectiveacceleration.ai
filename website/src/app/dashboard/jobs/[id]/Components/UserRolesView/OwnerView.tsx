'use client';
import {
  Job,
  JobEventWithDiffs,
  JobState,
  User,
} from 'effectiveacceleration-contracts';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import JobChatsList from '../JobChatsList';
import JobChat from '../JobChat';
import JobChatDetails from '../JobChatDetails';
import { JobViewProps } from '@/service/Interfaces';

export default function OwnerView({
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
      {job?.state === JobState.Open && address === job.roles.creator ? (
        <div className='col-span-1 max-h-customHeader overflow-y-auto border border-gray-100 bg-white p-3'>
          <JobChatsList
            users={users}
            job={job}
            setSelectedWorker={setSelectedWorker}
          />
        </div>
      ) : (
        ''
      )}
      <div
        className={`${job?.state === JobState.Open && address === job.roles.creator ? 'col-span-2' : 'col-span-3'} max-h-customHeader bg-white`}
      >
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
