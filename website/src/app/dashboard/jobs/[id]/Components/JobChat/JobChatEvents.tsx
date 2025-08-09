import Image from 'next/image';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';

import { renderEvent } from '@/components/Events';
import logoDark from '@/images/logo-light.png';
import noWorkInProgress from '@/images/noWorkInProgress.svg';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  JobState,
  type User,
} from '@effectiveacceleration/contracts/dist/src/interfaces';
import JobChatStatus from './JobChatStatus';
import useUser from '@/hooks/subsquid/useUser';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { ChevronDown, Mail } from 'lucide-react';

interface ResultAcceptedProps {
  job: Job;
  events: JobEventWithDiffs[];
  users: Record<string, User>;
  selectedWorker: string;
  address: string | undefined;
}
const JobChatEvents: React.FC<ResultAcceptedProps> = ({
  job,
  users,
  selectedWorker,
  events,
  address,
}) => {
  const { data: user } = useUser(address!);
  const searchParams = useSearchParams();
  const highlightedEventId = searchParams.get('eventId');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [newMessage, setNewMessage] = useState(false);
  const lastEvent = events[events.length - 1];
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    if (chatContainerRef.current) {
      const isAtBottom = (chatContainerRef.current.scrollTop + 100 + chatContainerRef.current.clientHeight) >= chatContainerRef.current.scrollHeight;
      if (isAtBottom) {
        setNewMessage(false);
        setShowNotification(false) 
      } else {
        setShowNotification(true)
      }
    }
  };

  const scrollToEnd = () => {
    if (chatContainerRef.current && chatContainerRef.current.scrollHeight !== undefined) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => {
        chatContainer.removeEventListener('scroll', handleScroll);
      };
    }
    scrollToEnd();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current && lastEvent?.address_ === user?.address_) {
      scrollToEnd();
    }
    if ((lastEvent?.type_ === JobEventType.OwnerMessage || lastEvent?.type_ === JobEventType.WorkerMessage) && lastEvent?.address_ !== user?.address_ && showNotification === true) {
      setNewMessage(true);
    }
  },[events]);

  return (
    <div ref={chatContainerRef} className='row-span-4 max-h-customHeader overflow-y-auto px-4 border border-gray-100 bg-softBlue relative'>
      {selectedWorker && events.length > 0 ? (
        <>
          <div className='flow-root w-full mt-4'>
            <ul role='list' className='-mb-8'>
              {events?.slice().map((event, index) => (
                <li key={index}>
                  <div className='relative pb-8'>
                    {index !== events?.length - 1 ? (
                      <span
                        className='absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200'
                        aria-hidden='true'
                      />
                    ) : null}
                    <div
                      className={clsx(
                        'relative flex items-start space-x-3',
                        event.id === highlightedEventId
                          ? 'border-r-2 border-dashed border-r-yellow-600'
                          : ''
                      )}
                    >
                      {renderEvent({ event })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <JobChatStatus
            events={events}
            users={users}
            selectedWorker={selectedWorker}
            job={job}
            address={address}
          />
        </>
      ) : (job.state === JobState.Closed) ? (
        <div className='flex h-full max-h-customHeader flex-col items-center justify-center gap-4'>
          <div>
            <Image
              className='max-h-[135px] max-w-[250px] text-center'
              src={noWorkInProgress}
              alt=''
              width={250}
              height={250}
            />
          </div>
          <div className='text-center'>
            This job has been closed
          </div>
        </div>
      ) : (
        <div className='flex h-full max-h-customHeader flex-col items-center justify-center gap-4'>
          <div>
            <Image
              className='max-h-[35px] max-w-[150px] text-center'
              src={logoDark}
              alt=''
              width={150}
              height={150}
            />
          </div>

          {job.roles.creator === address && (
            <div className='text-center'>
              A chat with the applying workers will appear here
            </div>
          )}
          {job.roles.creator !== address &&
            job.roles.worker !== address &&
            job.roles.arbitrator !== address && (
              <div className='text-center'>
                Apply to this job by chatting with the creator
              </div>
            )}
          {!user && address !== job.roles.arbitrator && (
            <div className='text-center'>
              <Button href='/register'>Sign in to chat with the creator</Button>
            </div>
          )}
          {address === job.roles.arbitrator && (
            <div className='text-center'>
              You are the arbitrator for this job, you will get a notification
              if there is a dispute
            </div>
          )}
        </div>
      )}
      {showNotification && (
        <div className='absolute bottom-3 right-12'>
          <div className="fixed py-[4px] max-h-[32px] px-[16px] hover:cursor-pointer bottom-20 rounded-full bg-gray-400 w-6 text-white place-items-center animate-[slideIn_0.5s_ease-out]">         
            <ChevronDown size='2' onClick={() => scrollToEnd()} className='w-6 h-6 text-sm text-white' />
            {newMessage && (
            <div className="top-[-38px] p-0.5 rounded-full left-[-12px] bg-rose-600 relative">
              <Mail className='w-4 h-4' />
            </div>
          )}
          </div>
        </div>
        
      )}
    </div>
  );
};

export default JobChatEvents;
