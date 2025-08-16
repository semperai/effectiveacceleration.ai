'use client';

import { Layout } from '@/components/Dashboard/Layout';
import { PostMessageButton } from './JobActions';
import useJob from '@/hooks/subsquid/useJob';
import useJobEventsWithDiffs from '@/hooks/subsquid/useJobEventsWithDiffs';
import useUser from '@/hooks/subsquid/useUser';
import useUsersByAddresses from '@/hooks/subsquid/useUsersByAddresses';
import { tokenIcon } from '@/lib/utils';
import { jobMeceTags } from '@/lib/constants';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  type JobMessageEvent,
  JobState,
} from '@effectiveacceleration/contracts';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import moment from 'moment';
import { useEffect, useRef, useState, useMemo } from 'react';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import JobChatEvents from './JobChat/JobChatEvents';
import JobChatsList from './JobChatsList';
import JobSidebar from './JobSidebar';
import OpenJobMobileMenu from './JobChat/OpenJobMobileMenu';
import { useSwResetMessage } from '@/hooks/useSwResetMessage';
import { useSearchParams } from 'next/navigation';

import {
  TestControlBar,
  generateTestData,
  scenarios,
  statusStates,
  renderStatusComponent,
} from './testUtils';

const JobPostSkeleton = () => {
  return (
    <div className='mx-auto max-w-2xl animate-pulse space-y-6 rounded-lg bg-white p-6 shadow-sm'>
      {/* Company logo and name skeleton */}
      <div className='flex items-center space-x-4'>
        <div className='h-16 w-16 rounded-lg bg-gray-200' />
        <div className='flex-1 space-y-2'>
          <div className='h-4 w-1/3 rounded bg-gray-200' />
          <div className='h-3 w-1/4 rounded bg-gray-200' />
        </div>
      </div>

      {/* Job title skeleton */}
      <div className='space-y-2'>
        <div className='h-6 w-3/4 rounded bg-gray-200' />
        <div className='h-4 w-1/2 rounded bg-gray-200' />
      </div>

      {/* Tags skeleton */}
      <div className='flex flex-wrap gap-2'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='h-8 w-24 rounded-full bg-gray-200' />
        ))}
      </div>

      {/* Description skeleton */}
      <div className='space-y-3'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='h-4 w-full rounded bg-gray-200' />
        ))}
      </div>

      {/* Loading spinner */}
      <div className='flex justify-center pt-4'>
        <Loader2 className='h-6 w-6 animate-spin text-blue-500' />
      </div>
    </div>
  );
};

interface JobPageClientProps {
  id: string;
}

export default function JobPageClient({ id }: JobPageClientProps) {
  const jobId = id;
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const isTestMode = searchParams.get('test') === '1';
  const highlightedEventId = searchParams.get('eventId');

  // Test mode state
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [testUserRole, setTestUserRole] = useState<
    'creator' | 'worker' | 'arbitrator' | 'guest'
  >('creator');
  const [selectedStatus, setSelectedStatus] = useState('none');
  const [multipleApplicants, setMultipleApplicants] = useState(true);

  // Real data hooks - use dummy ID when in test mode to avoid null issues
  const dummyId = 'test-job-id';
  const { data: job, error } = useJob(isTestMode ? dummyId : jobId);
  const {
    data: events,
    addresses,
    sessionKeys,
  } = useJobEventsWithDiffs(isTestMode ? dummyId : jobId);
  const { data: users } = useUsersByAddresses(isTestMode ? [] : addresses);
  const { data: user } = useUser(isTestMode ? '' : address || '');

  // Generate test data when in test mode
  const testData = useMemo(() => {
    if (!isTestMode) return null;
    return generateTestData(selectedScenario, testUserRole, multipleApplicants);
  }, [isTestMode, selectedScenario, testUserRole, multipleApplicants]);

  // Use test data or real data
  const currentJob = isTestMode ? testData?.job : job;
  const currentEvents = isTestMode ? testData?.events : events;
  const currentAddresses = isTestMode ? testData?.addresses : addresses;
  const currentSessionKeys = isTestMode ? testData?.sessionKeys : sessionKeys;
  const currentUsers = isTestMode ? testData?.users : users;
  const currentUser = isTestMode ? testData?.user : user;
  const currentAddress = isTestMode ? testData?.address : address;

  const whitelistedWorkers = currentEvents?.at(-1)?.job.allowedWorkers ?? [];
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [eventMessages, setEventMessages] = useState<
    JobEventWithDiffs[] | undefined
  >(currentEvents);
  const prevJobRef = useRef<Job | undefined>(undefined);

  // Only use real jobId for message reset, not test ID
  useSwResetMessage(isTestMode ? '' : jobId);

  // Check if user was an applicant but not selected
  const wasApplicantButNotSelected = useMemo(() => {
    if (!currentAddress || !currentEvents || !currentJob) return false;

    // Check if job is taken or closed
    if (
      currentJob.state !== JobState.Taken &&
      currentJob.state !== JobState.Closed
    ) {
      return false;
    }

    // Check if current user is NOT the selected worker
    if (currentJob.roles.worker === currentAddress) {
      return false;
    }

    // Check if current user is NOT the creator or arbitrator
    if (
      currentJob.roles.creator === currentAddress ||
      currentJob.roles.arbitrator === currentAddress
    ) {
      return false;
    }

    // Check if user had previously messaged in this job (was an applicant)
    const hadPreviousInteraction = currentEvents.some(
      (event: JobEventWithDiffs) =>
        (event.type_ === JobEventType.WorkerMessage &&
          event.address_ === currentAddress) ||
        (event.type_ === JobEventType.OwnerMessage &&
          (event.details as JobMessageEvent)?.recipientAddress ===
            currentAddress)
    );

    return hadPreviousInteraction;
  }, [currentAddress, currentEvents, currentJob]);

  // Auto-select worker from notification event
  useEffect(() => {
    if (highlightedEventId && currentEvents && currentJob && currentAddress) {
      // Find the event that matches the notification
      const targetEvent = currentEvents.find(
        (event) => event.id === highlightedEventId
      );

      if (
        targetEvent &&
        currentJob.state === JobState.Open &&
        currentAddress === currentJob.roles.creator
      ) {
        // For open jobs, if the creator is viewing and there's a message event
        // Select the worker who sent the message or is involved in the event
        let workerToSelect: string | null = null;

        if (targetEvent.type_ === JobEventType.WorkerMessage) {
          // Worker message - select the worker who sent it
          workerToSelect = targetEvent.address_;
        } else if (targetEvent.type_ === JobEventType.OwnerMessage) {
          // Owner message - select the recipient
          const messageDetails = targetEvent.details as JobMessageEvent;
          if (messageDetails?.recipientAddress) {
            workerToSelect = messageDetails.recipientAddress;
          }
        } else if (
          targetEvent.address_ &&
          targetEvent.address_ !== currentJob.roles.creator
        ) {
          // Any other event from a worker
          workerToSelect = targetEvent.address_;
        }

        if (workerToSelect) {
          setSelectedWorker(workerToSelect);
        }
      }
    }
  }, [highlightedEventId, currentEvents, currentJob, currentAddress]);

  // Calculate the time passed since the job was closed
  const timestamp = currentEvents
    ?.filter((event: JobEventWithDiffs) => event.type_ === JobEventType.Closed)
    .slice(-1)[0]?.timestamp_;
  const hoursPassed = moment().diff(moment(timestamp! * 1000), 'hours');
  const timePassed = hoursPassed >= 24;
  const progressValue = (hoursPassed / 24) * 100;
  const adjustedProgressValue =
    progressValue < 0 ? 100 + progressValue : 100 - progressValue;
  const jobMeceTag = jobMeceTags.find(
    (tag) => tag.id === currentJob?.tags[0]
  )?.name;

  // Check if user is associated with the job
  const isOwner =
    currentAddress && currentJob?.roles.creator === currentAddress;
  const isWorker =
    currentAddress && currentJob?.roles.worker === currentAddress;
  const isArbitrator =
    currentAddress && currentJob?.roles.arbitrator === currentAddress;

  // Check if user was a participant (for closed jobs)
  const wasParticipant = useMemo(() => {
    if (!currentAddress || !currentEvents) return false;

    // Check if user sent any messages or took any actions in this job
    return currentEvents.some(
      (event: JobEventWithDiffs) =>
        event.address_ === currentAddress ||
        (event.details as JobMessageEvent)?.recipientAddress === currentAddress
    );
  }, [currentAddress, currentEvents]);

  // Fixed conditions for showing chat interface
  const isJobOpenForWorker =
    currentJob?.roles.worker === zeroAddress &&
    currentJob?.state === JobState.Open &&
    currentAddress !== currentJob?.roles.creator &&
    currentAddress !== currentJob?.roles.arbitrator;

  // Show chat for closed jobs if user was involved
  const isClosedJobParticipant =
    currentJob?.state === JobState.Closed &&
    (isOwner || isWorker || wasParticipant);

  const isUserCreatorWithSelectedWorkerOrTaken =
    (currentAddress === currentJob?.roles.creator && selectedWorker) ||
    (currentAddress === currentJob?.roles.creator &&
      currentJob?.state === JobState.Taken);

  // Fixed: Show message button for open jobs when worker wants to apply
  // OR for participants in any state except fully closed without involvement
  // UPDATED: Don't show for non-selected applicants
  const shouldShowPostMessageButton =
    (currentJob?.state !== JobState.Closed || isClosedJobParticipant) &&
    currentAddresses?.length &&
    Object.keys(currentSessionKeys || {}).length > 0 &&
    !wasApplicantButNotSelected && // Don't show for non-selected applicants
    (isJobOpenForWorker || // Worker applying to open job
      isWorker || // Current worker on the job
      isOwner || // Job creator
      isUserCreatorWithSelectedWorkerOrTaken || // Creator with selected worker
      wasParticipant); // Was involved in the job

  useEffect(() => {
    // Don't override worker selection if it came from notification
    if (highlightedEventId && selectedWorker) {
      return;
    }

    // If user was an applicant but not selected, show their own conversation
    if (wasApplicantButNotSelected && currentAddress) {
      setSelectedWorker(currentAddress);
      return;
    }

    if (
      currentJob?.state === JobState.Taken ||
      currentJob?.state === JobState.Closed
    ) {
      setSelectedWorker(currentJob.roles.worker);
    }

    // For FCFS jobs, automatically set selectedWorker for potential workers
    if (
      currentAddress &&
      currentJob?.state === JobState.Open &&
      !currentJob?.multipleApplicants && // FCFS job
      currentAddress !== currentJob.roles.creator &&
      currentAddress !== currentJob.roles.arbitrator
    ) {
      setSelectedWorker(currentAddress); // Set worker as selected to show FCFS status
    } else if (
      currentAddress &&
      currentJob?.state === JobState.Open &&
      currentJob?.multipleApplicants && // Multiple applicant job
      currentAddress !== currentJob.roles.creator
    ) {
      setSelectedWorker(currentAddress);
    }
  }, [
    currentJob,
    currentAddress,
    wasApplicantButNotSelected,
    highlightedEventId,
    selectedWorker,
  ]);

  useEffect(() => {
    // If user was an applicant but not selected, show only their conversation
    if (wasApplicantButNotSelected) {
      setEventMessages(
        currentEvents?.filter(
          (event: JobEventWithDiffs) =>
            (event.type_ === JobEventType.WorkerMessage &&
              event.address_ === currentAddress) ||
            (event.type_ === JobEventType.OwnerMessage &&
              (event.details as JobMessageEvent)?.recipientAddress ===
                currentAddress) ||
            // Include important job events but not other workers' messages
            [
              JobEventType.Created,
              JobEventType.Updated,
              JobEventType.Taken,
              JobEventType.Closed,
              JobEventType.Completed,
            ].includes(event.type_)
        )
      );
      return;
    }

    // Check if user is an observer (not creator, worker, or arbitrator)
    const isObserver =
      currentAddress &&
      currentJob?.roles.creator !== currentAddress &&
      currentJob?.roles.worker !== currentAddress &&
      currentJob?.roles.arbitrator !== currentAddress &&
      (currentJob?.state === JobState.Taken ||
        currentJob?.state === JobState.Closed);

    // If user is an observer, only show non-message events
    if (isObserver) {
      setEventMessages(
        currentEvents?.filter(
          (event: JobEventWithDiffs) =>
            // Only show system events, not messages
            ![JobEventType.WorkerMessage, JobEventType.OwnerMessage].includes(
              event.type_
            )
        )
      );
      return;
    }

    if (currentJob?.state === JobState.Open) {
      // For FCFS jobs that are open
      if (!currentJob.multipleApplicants) {
        if (isOwner) {
          // Owner should only see events related to selected worker
          setEventMessages(
            currentEvents?.filter(
              (event: JobEventWithDiffs) =>
                event.address_ === selectedWorker ||
                (event.details as JobMessageEvent)?.recipientAddress ===
                  selectedWorker ||
                // Include system events like Created, Updated
                [JobEventType.Created, JobEventType.Updated].includes(event.type_)
            ) || []
          );
        } else if (isWorker) {
          // Worker should only see events related to job owner and their own chat
          setEventMessages(
            currentEvents?.filter(
              (event: JobEventWithDiffs) =>
                event.address_ === currentJob.roles.creator ||
                event.address_ === currentAddress ||
                (event.details as JobMessageEvent)?.recipientAddress ===
                  currentAddress ||
                (event.details as JobMessageEvent)?.recipientAddress ===
                  currentJob.roles.creator ||
                // Include system events like Created, Updated
                [ 
                  JobEventType.Created,
                  JobEventType.Updated,
                  JobEventType.Taken,
                  JobEventType.Closed,
                  JobEventType.Completed
                ].includes(event.type_)
            ) || []
          );
        } else {
          // For other users, show all events (default FCFS behavior)
          setEventMessages(currentEvents || []);
        }
      } else {
        // For multiple applicant jobs, filter by selected worker
        setEventMessages(
          currentEvents?.filter(
            (event: JobEventWithDiffs) =>
              event.address_ === selectedWorker ||
              (event.details as JobMessageEvent)?.recipientAddress ===
                selectedWorker ||
              // Include important system events 
              [ 
                JobEventType.Created,
                JobEventType.Updated,
                JobEventType.Taken,
                JobEventType.Closed,
                JobEventType.Completed
              ].includes(event.type_)
          ) || []
        );
      }
    } else if (
      currentJob?.state === JobState.Taken ||
      currentJob?.state === JobState.Closed
    ) {
      // For FCFS jobs that are taken/closed, show all events
      if (!currentJob.multipleApplicants) {
        setEventMessages(currentEvents);
      } else {
        // For multiple applicant jobs, use existing logic
        let lastIndex = -1;

        for (let i = (currentEvents?.length || 0) - 1; i >= 0; i--) {
          if (currentEvents![i].type_ === JobEventType.Taken) {
            lastIndex = i;
            break;
          }
        }

        // All message events before job started
        const additionalEvents = currentEvents?.filter(
          (event, index) =>
            index < lastIndex &&
            ((event.type_ === JobEventType.WorkerMessage &&
              event.address_ === selectedWorker &&
              (event.details as JobMessageEvent)?.recipientAddress ===
                currentJob.roles.creator) ||
              (event.type_ === JobEventType.OwnerMessage &&
                event.address_ === currentJob.roles.creator &&
                (event.details as JobMessageEvent)?.recipientAddress ===
                  selectedWorker))
        );

        // All events after job started
        const filteredEvents =
          lastIndex !== -1
            ? [
                ...(additionalEvents || []),
                ...(currentEvents?.slice(lastIndex) || []),
              ]
            : [...(additionalEvents || [])];
        setEventMessages(filteredEvents);
      }
    } else {
      setEventMessages(currentEvents);
    }
  }, [
    currentEvents,
    selectedWorker,
    currentJob,
    currentAddress,
    wasApplicantButNotSelected,
  ]);

  if (!isTestMode && error) {
    return (
      <Layout>
        <p className='text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400'>
          Job not found
        </p>
      </Layout>
    );
  }

  if (!currentJob) {
    return (
      <Layout>
        <JobPostSkeleton />
      </Layout>
    );
  }

  return (
    <Layout borderless>
      {/* Test Control Bar - only shown in test mode */}
      {isTestMode && (
        <TestControlBar
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          userRole={testUserRole}
          setUserRole={setTestUserRole}
          currentJob={currentJob}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          multipleApplicants={multipleApplicants}
          setMultipleApplicants={setMultipleApplicants}
        />
      )}

      {/* Status State Component - shown when selected in test mode */}
      {isTestMode && selectedStatus !== 'none' && (
        <div className='mx-auto max-w-4xl p-4'>
          <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
            {renderStatusComponent(
              selectedStatus,
              currentJob,
              currentAddress,
              currentUsers,
              currentUser ?? undefined,
              selectedWorker,
              currentEvents,
              currentSessionKeys,
              currentAddresses
            )}
          </div>
        </div>
      )}

      {/* Main Job Interface - hidden when status state is selected */}
      {(!isTestMode || selectedStatus === 'none') && (
        <div className='grid min-h-customHeader grid-cols-1'>
          <div className='grid min-h-customHeader grid-cols-2 md:grid-cols-4'>
            {isOwner && currentJob?.state === JobState.Open && (
              <div className='col-span-1 hidden max-h-customHeader overflow-y-auto border border-gray-100 bg-white p-3 md:block'>
                <JobChatsList
                  users={currentUsers ?? {}}
                  job={currentJob}
                  setSelectedWorker={setSelectedWorker}
                  selectedWorker={selectedWorker}
                />
              </div>
            )}

            <div
              className={clsx(
                (currentJob.state === JobState.Open && !isOwner) ||
                  currentJob.state === JobState.Taken ||
                  currentJob.state === JobState.Closed
                  ? 'col-span-3'
                  : 'col-span-2',
                'max-h-customHeader bg-white'
              )}
            >
              {currentJob && (
                <div className='grid max-h-customHeader min-h-customHeader grid-rows-[74px_auto_1fr]'>
                  <OpenJobMobileMenu
                    users={currentUsers ?? {}}
                    selectedWorker={selectedWorker}
                    eventMessages={eventMessages ?? []}
                    address={currentAddress as `0x${string}`}
                    job={currentJob}
                    events={eventMessages ?? []}
                    addresses={currentAddresses ?? []}
                    sessionKeys={currentSessionKeys ?? {}}
                    jobMeceTag={jobMeceTag ?? ''}
                    timePassed={timePassed}
                    adjustedProgressValue={adjustedProgressValue}
                    tokenIcon={tokenIcon}
                    setSelectedWorker={setSelectedWorker}
                    whitelistedWorkers={whitelistedWorkers}
                    user={currentUser ?? undefined}
                  />
                  <JobChatEvents
                    users={currentUsers ?? {}}
                    selectedWorker={selectedWorker}
                    events={(eventMessages as JobEventWithDiffs[]) ?? []}
                    job={currentJob}
                    address={currentAddress}
                    currentUser={currentUser ?? undefined}
                  />
                  {currentJob && shouldShowPostMessageButton && (
                    <div className='row-span-1 flex flex-1 content-center items-center border border-gray-100 md:block'>
                      {isTestMode ? (
                        // Mock PostMessageButton for test mode
                        <div className='flex h-full items-center justify-center p-4'>
                          <div className='w-full'>
                            <div className='flex items-end gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm'>
                              <textarea
                                rows={1}
                                placeholder='Type a message... (disabled in test mode)'
                                className='min-h-[36px] flex-1 resize-none rounded-lg border-0 bg-transparent px-2 py-1 text-sm text-gray-900 outline-none'
                                disabled
                              />
                              <button
                                disabled
                                className='flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-xl bg-gray-100'
                              >
                                <svg
                                  className='h-4 w-4 text-gray-400'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <PostMessageButton
                          address={currentAddress}
                          recipient={
                            selectedWorker ||
                            (isJobOpenForWorker
                              ? currentJob.roles.creator
                              : selectedWorker)
                          }
                          addresses={currentAddresses ?? []}
                          sessionKeys={currentSessionKeys ?? {}}
                          job={currentJob}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className='hidden md:block'>
              <JobSidebar
                job={currentJob}
                address={currentAddress as `0x${string}`}
                events={(eventMessages as JobEventWithDiffs[]) ?? []}
                addresses={currentAddresses ?? []}
                sessionKeys={currentSessionKeys ?? {}}
                users={currentUsers ?? {}}
                jobMeceTag={jobMeceTag ?? ''}
                timePassed={timePassed}
                adjustedProgressValue={adjustedProgressValue}
                whitelistedWorkers={whitelistedWorkers}
                tokenIcon={tokenIcon}
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
