import Image from 'next/image';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';

import { renderEvent } from './Events';
import logoDark from '@/images/logo-light.png';
import noWorkInProgress from '@/images/noWorkInProgress.svg';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  JobState,
  type User,
  type JobMessageEvent,
} from '@effectiveacceleration/contracts/dist/src/interfaces';
import JobChatStatus from './JobChatStatus';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { ChevronDown, Mail } from 'lucide-react';

interface JobChatEventsProps {
  job: Job;
  events: JobEventWithDiffs[];
  users: Record<string, User>;
  selectedWorker: string;
  address: string | undefined;
  currentUser?: User | null;
}

const JobChatEvents: React.FC<JobChatEventsProps> = ({
  job,
  users,
  selectedWorker,
  events,
  address,
  currentUser,
}) => {
  const searchParams = useSearchParams();
  const highlightedEventId = searchParams.get('eventId');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [newMessage, setNewMessage] = useState(false);
  const lastEvent = events[events.length - 1];
  const eventRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const hasScrolledToEvent = useRef(false);

  // Check if user was an applicant but not selected
  const wasApplicantButNotSelected = (() => {
    if (!address || !events || !job) return false;

    // Check if job is taken or closed
    if (job.state !== JobState.Taken && job.state !== JobState.Closed) {
      return false;
    }

    // Check if current user is NOT the selected worker
    if (job.roles.worker === address) {
      return false;
    }

    // Check if current user is NOT the creator or arbitrator
    if (job.roles.creator === address || job.roles.arbitrator === address) {
      return false;
    }

    // Check if user had previously messaged in this job (was an applicant)
    const hadPreviousInteraction = events.some(
      (event: JobEventWithDiffs) =>
        (event.type_ === JobEventType.WorkerMessage &&
          event.address_ === address) ||
        (event.type_ === JobEventType.OwnerMessage &&
          (event.details as JobMessageEvent)?.recipientAddress === address)
    );

    return hadPreviousInteraction;
  })();

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    if (chatContainerRef.current) {
      const isAtBottom =
        chatContainerRef.current.scrollTop +
          100 +
          chatContainerRef.current.clientHeight >=
        chatContainerRef.current.scrollHeight;
      if (isAtBottom) {
        setNewMessage(false);
        setShowNotification(false);
      } else {
        setShowNotification(true);
      }
    }
  };

  const scrollToEnd = () => {
    if (
      chatContainerRef.current &&
      chatContainerRef.current.scrollHeight !== undefined
    ) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // Scroll to highlighted event when the component mounts or eventId changes
  useEffect(() => {
    if (highlightedEventId && !hasScrolledToEvent.current) {
      // Small delay to ensure DOM is ready and refs are set
      const scrollTimeout = setTimeout(() => {
        const targetElement = eventRefs.current[highlightedEventId];
        if (targetElement && chatContainerRef.current) {
          // Calculate the position to scroll to (with some offset from top)
          const containerRect =
            chatContainerRef.current.getBoundingClientRect();
          const elementRect = targetElement.getBoundingClientRect();
          const scrollTop = chatContainerRef.current.scrollTop;
          const offsetFromTop = 100; // Offset from top of container for better visibility

          const targetScrollPosition =
            scrollTop + (elementRect.top - containerRect.top) - offsetFromTop;

          // Smooth scroll to the target event
          chatContainerRef.current.scrollTo({
            top: targetScrollPosition,
            behavior: 'smooth',
          });

          // Add a visual pulse effect to draw attention
          targetElement.classList.add('animate-pulse-highlight');

          // Remove the pulse effect after animation completes
          setTimeout(() => {
            targetElement.classList.remove('animate-pulse-highlight');
          }, 2000);

          hasScrolledToEvent.current = true;
        }
      }, 500); // Delay to ensure events are rendered

      return () => clearTimeout(scrollTimeout);
    }
  }, [highlightedEventId, events]); // Also depend on events to re-trigger when they load

  // Reset the scroll flag when eventId changes
  useEffect(() => {
    hasScrolledToEvent.current = false;
  }, [highlightedEventId]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => {
        chatContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Scroll to bottom when events change (new messages) or when component mounts
  // But not if we have a highlighted event to scroll to
  useEffect(() => {
    if (!highlightedEventId && events.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToEnd();
      }, 100);
    }
  }, [events.length]); // Only depend on events length, not highlightedEventId

  useEffect(() => {
    // Auto-scroll to bottom when user sends a message
    if (
      chatContainerRef.current &&
      lastEvent?.address_ === currentUser?.address_ &&
      !highlightedEventId // Don't auto-scroll if we're highlighting an event
    ) {
      scrollToEnd();
    }
    // Show new message notification
    if (
      (lastEvent?.type_ === JobEventType.OwnerMessage ||
        lastEvent?.type_ === JobEventType.WorkerMessage) &&
      lastEvent?.address_ !== currentUser?.address_ &&
      showNotification === true
    ) {
      setNewMessage(true);
    }
  }, [events, currentUser, highlightedEventId]);

  useEffect(() => {
    const ids = new Set(
      events.map((e) => String(e.id)).filter(Boolean) as string[]
    );
    for (const key of Object.keys(eventRefs.current)) {
      if (!ids.has(key)) delete eventRefs.current[key];
    }
  }, [events]);

  // Show special message for non-selected applicants
  const getEmptyStateMessage = () => {
    // Check if user is an observer
    const isObserver =
      address &&
      job.roles.creator !== address &&
      job.roles.worker !== address &&
      job.roles.arbitrator !== address &&
      (job.state === JobState.Taken || job.state === JobState.Closed);

    if (isObserver) {
      return (
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
            <p className='text-gray-700 dark:text-gray-300'>
              This job is{' '}
              {job.state === JobState.Taken ? 'in progress' : 'completed'}
            </p>
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
              Private messages between parties are not visible to observers
            </p>
          </div>
        </div>
      );
    }

    if (wasApplicantButNotSelected) {
      return (
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
            <p className='text-gray-700 dark:text-gray-300'>
              Your conversation history is shown above
            </p>
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
              The creator has selected another applicant for this job
            </p>
          </div>
        </div>
      );
    }

    if (job.state === JobState.Closed) {
      return (
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
          <div className='text-center'>This job has been closed</div>
        </div>
      );
    }

    // For FCFS jobs
    const isFCFS = !job.multipleApplicants;

    return (
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
            {isFCFS
              ? 'Waiting for a worker to take this job'
              : 'A chat with the applying workers will appear here'}
          </div>
        )}
        {job.roles.creator !== address &&
          job.roles.worker !== address &&
          job.roles.arbitrator !== address && (
            <div className='text-center'>
              {isFCFS
                ? 'Take this job to start working immediately!'
                : 'Apply to this job by chatting with the creator'}
            </div>
          )}
        {!currentUser && address !== job.roles.arbitrator && (
          <div className='text-center'>
            <Button href='/register'>
              Sign in to {isFCFS ? 'take this job' : 'chat with the creator'}
            </Button>
          </div>
        )}
        {address === job.roles.arbitrator && (
          <div className='text-center'>
            You are the arbitrator for this job, you will get a notification if
            there is a dispute
          </div>
        )}
      </div>
    );
  };

  // Check if this is an FCFS job and user can take it
  const isFCFSJob = job.state === JobState.Open && !job.multipleApplicants;
  const canTakeFCFS =
    isFCFSJob &&
    address !== job.roles.creator &&
    address !== job.roles.arbitrator;

  return (
    <>
      <div
        ref={chatContainerRef}
        className='notifications-scroll relative row-span-4 max-h-customHeader overflow-y-auto border border-gray-100 bg-softBlue px-4'
      >
        {(selectedWorker && events.length > 0) || canTakeFCFS ? (
          <>
            {events.length > 0 ? (
              <div className='mt-4 flow-root w-full'>
                <ul role='list' className='-mb-8'>
                  {events?.slice().map((event, index) => (
                    <li key={event.id || index}>
                      <div
                        className={clsx(
                          'relative flex scroll-mt-24 items-start space-x-3 rounded-lg transition-all duration-300',
                          String(event.id) === String(highlightedEventId)
                            ? 'border-r-4 border-dashed border-r-yellow-500 bg-yellow-50/50 pr-2 dark:bg-yellow-900/10'
                            : ''
                        )}
                        ref={(el) => {
                          if (event.id) {
                            eventRefs.current[String(event.id)] = el;
                          }
                        }}
                      >
                        {index !== events?.length - 1 ? (
                          <span
                            className='absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200'
                            aria-hidden='true'
                          />
                        ) : null}
                        <div
                          className={clsx(
                            'relative flex scroll-mt-24 items-start space-x-3 rounded-lg transition-all duration-300',
                            String(event.id) === String(highlightedEventId)
                              ? 'border-r-4 border-dashed border-r-yellow-500 bg-yellow-50/50 pr-2 dark:bg-yellow-900/10'
                              : ''
                          )}
                        >
                          {renderEvent({
                            event,
                            users,
                            currentUser,
                            job,
                          })}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              // No events yet but FCFS job - show status
              <div className='mt-4'>{/* Empty div to maintain layout */}</div>
            )}
            <JobChatStatus
              events={events}
              users={users}
              selectedWorker={selectedWorker}
              job={job}
              address={address}
              currentUser={currentUser}
            />
          </>
        ) : (
          getEmptyStateMessage()
        )}
        {showNotification && (
          <div className='absolute bottom-3 right-12'>
            <div className='fixed bottom-20 max-h-[32px] w-6 animate-[slideIn_0.5s_ease-out] place-items-center rounded-full bg-gray-400 px-[16px] py-[4px] text-white hover:cursor-pointer'>
              <ChevronDown
                onClick={() => scrollToEnd()}
                role='button'
                tabIndex={0}
                aria-label='Scroll to latest message'
                className='h-6 w-6 text-sm text-white'
              />
              {newMessage && (
                <div className='relative left-[-12px] top-[-38px] rounded-full bg-rose-600 p-0.5'>
                  <Mail className='h-4 w-4' />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default JobChatEvents;
