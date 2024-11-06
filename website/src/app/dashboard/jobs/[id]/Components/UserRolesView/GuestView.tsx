"use client";
import { Job, JobEventWithDiffs, JobState, User } from 'effectiveacceleration-contracts';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import JobChatsList from '../JobChatsList';
import JobChat from '../JobChat';
import JobChatDetails from '../JobChatDetails';
import { JobViewProps } from '@/service/Interfaces';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { shortenText } from '@/utils/utils'

export default function GuestView({users, selectedWorker, events, job, address, addresses, sessionKeys, jobUsersData, setSelectedWorker, eventMessages, whitelistedWorkers} : JobViewProps) {
  const jobOwnerData = jobUsersData ? jobUsersData[job.roles.creator] : null;
  const ownerAddress = jobOwnerData?.address_ as `0x${string}` | undefined;
  return (
      <div className='grid grid-cols-4 min-h-customHeader'>
        <div className='p-5 col-span-1 bg-white max-h-customHeader'>
            <h1 className='font-bold'>{job.title}</h1>
            <span>{job.content}</span>
            <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Customer</label>
        <div className="flex items-center space-x-2 mt-1">
          <Image
            className="object-cover rounded-full"
            height={50}
            width={50}
            src={jobOwnerData?.avatar as string | StaticImport}
            alt="Profile picture"
          />
          {jobOwnerData?.name ? (
            <span>{jobOwnerData.name}</span>
          ) : (
            <span>{shortenText({ text: ownerAddress, maxLength: 12 }) || ''}</span>
          )}
        </div>
      </div>
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