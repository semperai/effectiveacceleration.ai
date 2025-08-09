import EventProfileImage from '@/components/Events/Components/EventProfileImage';
import type { Job, User } from '@effectiveacceleration/contracts';
import Image from 'next/image';
import type { Dispatch, SetStateAction } from 'react';

const JobChatsList = ({
  users,
  job,
  setSelectedWorker,
  setSidebarOpen
}: {
  users: Record<string, User>;
  job: Job | undefined;
  setSelectedWorker: Dispatch<SetStateAction<string>>;
  setSidebarOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const numberOfWorkers = Object.keys(users).length - 1; // -1 to exclude the creator;
  return (
    <div>
      <div>
        <span className='font-bold'>Chats</span>
      </div>
      {numberOfWorkers === 0 ? (
        <div>
          <span className='text-sm text-darkBlueFont'>
            There are no applicants yet
          </span>
        </div>
      ) : (
        <div>
          <span className='text-sm text-darkBlueFont'>
            {numberOfWorkers}/{numberOfWorkers} applicants reviewed
          </span>
        </div>
      )}

      <ul>
        {Object.entries(users).map(([key, value]) =>
          job?.roles.creator !== key ? (
            <li
              key={key}
              className='flex cursor-pointer pr-2 flex-row rounded py-2 px-2 place-items-center hover:bg-slate-100'
              onClick={() => {
                setSelectedWorker(key); 
                if (setSidebarOpen) setSidebarOpen(false);}}
              >
              <EventProfileImage user={value}></EventProfileImage>
              <div className='items-left flex flex-[4] flex-col ml-2 max-w-[75%]'>
                <span className='overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap'>{value.name}</span>
                <p className='... max-w-56 truncate text-xs text-darkBlueFont overflow-hidden text-ellipsis whitespace-nowrap'>
                  {value.bio}
                </p>
              </div>
              <div className='flex flex-1'>
                {/* {applicant.lastMessageHour} */}
              </div>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};

export default JobChatsList;
