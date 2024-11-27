import { Job, User } from '@effectiveacceleration/contracts';
import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';

const JobChatsList = ({
  users,
  job,
  setSelectedWorker,
}: {
  users: Record<string, User>;
  job: Job | undefined;
  setSelectedWorker: Dispatch<SetStateAction<string>>;
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
              className='flex cursor-pointer flex-row rounded py-2 hover:bg-slate-100'
              onClick={() => setSelectedWorker(key)}
            >
              <Image
                className='mr-2 flex max-h-10 max-w-10 flex-1 items-center rounded-lg'
                src={`${value.avatar ? value.avatar : '/profilePicture.webp'}`}
                height={100}
                width={100}
                alt={'Profile picture'}
              ></Image>
              <div className='items-left flex flex-[4] flex-col'>
                <span>{value.name}</span>
                <p className='... max-w-56 truncate text-sm text-darkBlueFont'>
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
