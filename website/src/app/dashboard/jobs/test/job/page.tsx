'use client';

import { useState } from 'react';
import { Layout } from '@/components/Dashboard/Layout';
// Updated imports for the refactored components
import JobChatEvents from '@/app/dashboard/jobs/[id]/JobChat/JobChatEvents';
import JobChatsList from '@/app/dashboard/jobs/[id]/JobChatsList';
import JobSidebar from '@/app/dashboard/jobs/[id]/JobSidebar';
import OpenJobMobileMenu from '@/app/dashboard/jobs/[id]/JobChat/OpenJobMobileMenu';
import { PostMessageButton } from '../../[id]/JobActions';

import {
  Job,
  JobState,
  JobEventType,
  type JobEventWithDiffs,
  type User,
  type JobMessageEvent,
  type JobArbitratedEvent,
  type JobRatedEvent,
  type JobDisputedEvent,
  type JobUpdatedEvent,
} from '@effectiveacceleration/contracts';
import { zeroAddress, zeroHash, toHex } from 'viem';
import { tokenIcon } from '@/lib/tokens';
import clsx from 'clsx';

// Mock addresses
const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
const mockWorkerAddress = '0x5aeda56215b167893e80b4fe645ba6d5bab767de';
const mockWorkerAddress2 = '0x6aeda56215b167893e80b4fe645ba6d5bab767df';
const mockArbitratorAddress = '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199';

// Create complete mock user data
const createMockUser = (
  address: string,
  name: string,
  role: string = ''
): User => ({
  address_: address,
  publicKey: 'mock-public-key-' + address.slice(0, 8),
  name: name,
  bio: `Experienced ${role || 'professional'} specializing in blockchain and web3 technologies. ${
    role === 'arbitrator'
      ? 'Fair and impartial dispute resolution with 50+ cases resolved.'
      : 'Building innovative solutions for the decentralized future.'
  }`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
  reputationUp: Math.floor(Math.random() * 50) + 10,
  reputationDown: Math.floor(Math.random() * 5),
});

const createMockJob = (state: JobState, disputed: boolean = false): Job => ({
  id: '1',
  state: state,
  title: 'Build a DeFi Dashboard with Real-time Analytics',
  content:
    'We need an experienced developer to create a comprehensive DeFi dashboard that tracks multiple protocols, displays real-time analytics, and provides portfolio management features. The dashboard should support multiple chains and have a responsive design.',
  contentHash:
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  tags: ['defi', 'react', 'web3', 'typescript', 'analytics'],
  token: '0x0000000000000000000000000000000000000000',
  amount: BigInt('1000000000000000000'),
  maxTime: 604800,
  deliveryMethod: 'IPFS',
  collateralOwed: disputed ? BigInt('100000000000000000') : BigInt('0'),
  escrowId: BigInt('1'),
  resultHash:
    state === JobState.Taken && !disputed
      ? '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12'
      : zeroHash,
  rating: state === JobState.Closed ? 5 : 0,
  disputed: disputed,
  timestamp: Math.floor(Date.now() / 1000) - 86400,
  roles: {
    creator: mockAddress,
    worker: state !== JobState.Open ? mockWorkerAddress : zeroAddress,
    arbitrator: mockArbitratorAddress,
  },
  jobTimes: {
    createdAt: Math.floor(Date.now() / 1000) - 172800,
    openedAt: Math.floor(Date.now() / 1000) - 172800,
    assignedAt:
      state !== JobState.Open ? Math.floor(Date.now() / 1000) - 86400 : 0,
    closedAt:
      state === JobState.Closed ? Math.floor(Date.now() / 1000) - 3600 : 0,
    disputedAt: disputed ? Math.floor(Date.now() / 1000) - 7200 : 0,
    arbitratedAt:
      disputed && state === JobState.Closed
        ? Math.floor(Date.now() / 1000) - 1800
        : 0,
    updatedAt: Math.floor(Date.now() / 1000) - 3600,
    lastEventAt: Math.floor(Date.now() / 1000) - 1800,
  },
  whitelistWorkers: false,
  multipleApplicants: true,
  allowedWorkers: [],
  result: '',
});

// Helper function for event data
const getEventData = (type: JobEventType): string => {
  switch (type) {
    case JobEventType.Taken:
      return toHex(BigInt('1'));
    case JobEventType.Delivered:
      return '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12';
    default:
      return '0x00';
  }
};

// Create mock event with proper timestamp ordering
let eventTimestamp = Math.floor(Date.now() / 1000) - 259200; // Start 3 days ago
const getNextTimestamp = () => {
  eventTimestamp += Math.floor(Math.random() * 3600) + 1800; // Add 0.5-1.5 hours
  return eventTimestamp;
};

const createMockEvent = (
  type: JobEventType,
  address: string,
  details?: any,
  diffs?: any[]
): JobEventWithDiffs => {
  const eventJob = createMockJob(JobState.Open);

  // Update job state based on event type
  switch (type) {
    case JobEventType.Taken:
      eventJob.state = JobState.Taken;
      eventJob.roles.worker = mockWorkerAddress;
      break;
    case JobEventType.Delivered:
      eventJob.state = JobState.Taken;
      eventJob.roles.worker = mockWorkerAddress;
      if (details?.result) {
        eventJob.result = details.result;
        eventJob.resultHash =
          '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12';
      }
      break;
    case JobEventType.Completed:
      eventJob.state = JobState.Closed;
      eventJob.roles.worker = mockWorkerAddress;
      break;
    case JobEventType.Disputed:
      eventJob.state = JobState.Taken;
      eventJob.disputed = true;
      eventJob.roles.worker = mockWorkerAddress;
      break;
    case JobEventType.Arbitrated:
      eventJob.state = JobState.Closed;
      eventJob.disputed = false;
      eventJob.roles.worker = mockWorkerAddress;
      break;
  }

  return {
    id: Math.random().toString(),
    jobId: BigInt('1'),
    type_: type,
    address_: address,
    data_: getEventData(type),
    timestamp_: getNextTimestamp(),
    job: eventJob,
    details: details || {},
    diffs: diffs || [],
  };
};

// Create simpler scenario events
const createScenarioEvents = (scenario: string): JobEventWithDiffs[] => {
  // Reset timestamp for consistent ordering
  eventTimestamp = Math.floor(Date.now() / 1000) - 259200;

  const baseEvents = [
    createMockEvent(JobEventType.Created, mockAddress, {}, [
      { field: 'state', oldValue: null, newValue: 'Open' },
      {
        field: 'title',
        oldValue: null,
        newValue: 'Build a DeFi Dashboard with Real-time Analytics',
      },
    ]),
  ];

  switch (scenario) {
    case 'open':
      return [
        ...baseEvents,
        createMockEvent(JobEventType.WorkerMessage, mockWorkerAddress, {
          message:
            "Hi! I'm interested in this job. I have 5 years of experience.",
          sender: mockWorkerAddress,
          recipientAddress: mockAddress,
        } as JobMessageEvent),
        createMockEvent(JobEventType.OwnerMessage, mockAddress, {
          message: 'Great! Can you share your portfolio?',
          sender: mockAddress,
          recipientAddress: mockWorkerAddress,
        } as JobMessageEvent),
      ];

    case 'taken':
      return [
        ...baseEvents,
        createMockEvent(JobEventType.Taken, mockWorkerAddress, {}, [
          { field: 'state', oldValue: 'Open', newValue: 'Taken' },
          {
            field: 'roles.worker',
            oldValue: null,
            newValue: mockWorkerAddress,
          },
        ]),
        createMockEvent(JobEventType.WorkerMessage, mockWorkerAddress, {
          message:
            "I've started working on the dashboard. Will update you soon!",
          sender: mockWorkerAddress,
          recipientAddress: mockAddress,
        } as JobMessageEvent),
      ];

    case 'delivered':
      return [
        ...baseEvents,
        createMockEvent(JobEventType.Taken, mockWorkerAddress, {}, [
          { field: 'state', oldValue: 'Open', newValue: 'Taken' },
          {
            field: 'roles.worker',
            oldValue: null,
            newValue: mockWorkerAddress,
          },
        ]),
        createMockEvent(JobEventType.Delivered, mockWorkerAddress, {
          result:
            'Dashboard complete! Live URL: https://defi-dashboard.vercel.app',
        }),
      ];

    case 'completed':
      return [
        ...baseEvents,
        createMockEvent(JobEventType.Taken, mockWorkerAddress, {}, [
          { field: 'state', oldValue: 'Open', newValue: 'Taken' },
          {
            field: 'roles.worker',
            oldValue: null,
            newValue: mockWorkerAddress,
          },
        ]),
        createMockEvent(JobEventType.Delivered, mockWorkerAddress, {
          result: 'Work completed successfully!',
        }),
        createMockEvent(JobEventType.Completed, mockAddress, {}, [
          { field: 'state', oldValue: 'Taken', newValue: 'Closed' },
        ]),
        createMockEvent(JobEventType.Rated, mockAddress, {
          rating: 5,
          review: 'Excellent work!',
        } as JobRatedEvent),
      ];

    case 'disputed':
      return [
        ...baseEvents,
        createMockEvent(JobEventType.Taken, mockWorkerAddress, {}, [
          { field: 'state', oldValue: 'Open', newValue: 'Taken' },
          {
            field: 'roles.worker',
            oldValue: null,
            newValue: mockWorkerAddress,
          },
        ]),
        createMockEvent(
          JobEventType.Disputed,
          mockAddress,
          {
            reason: 'The delivered work is incomplete.',
          } as JobDisputedEvent,
          [{ field: 'disputed', oldValue: false, newValue: true }]
        ),
      ];

    default:
      return baseEvents;
  }
};

// Create comprehensive mock users with all needed data
const mockUsers: Record<string, User> = {
  [mockAddress]: createMockUser(mockAddress, 'Alice Thompson', 'creator'),
  [mockWorkerAddress]: createMockUser(
    mockWorkerAddress,
    'Bob Johnson',
    'developer'
  ),
  [mockWorkerAddress2]: createMockUser(
    mockWorkerAddress2,
    'Carol Smith',
    'developer'
  ),
  [mockArbitratorAddress]: createMockUser(
    mockArbitratorAddress,
    'Charlie Wilson',
    'arbitrator'
  ),
};

const scenarios = [
  { id: 'open', label: 'Open', state: JobState.Open },
  { id: 'taken', label: 'In Progress', state: JobState.Taken },
  {
    id: 'delivered',
    label: 'Delivered',
    state: JobState.Taken,
    hasResult: true,
  },
  { id: 'completed', label: 'Completed', state: JobState.Closed },
  { id: 'disputed', label: 'Disputed', state: JobState.Taken, disputed: true },
];

export default function JobInterfaceTestPage() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [selectedWorker, setSelectedWorker] = useState(mockWorkerAddress);
  const [userRole, setUserRole] = useState<'creator' | 'worker' | 'arbitrator'>(
    'creator'
  );

  const getCurrentAddress = () => {
    switch (userRole) {
      case 'creator':
        return mockAddress;
      case 'worker':
        return mockWorkerAddress;
      case 'arbitrator':
        return mockArbitratorAddress;
      default:
        return mockAddress;
    }
  };

  const currentAddress = getCurrentAddress();
  const currentJob = createMockJob(
    selectedScenario.state,
    selectedScenario.disputed
  );

  if (selectedScenario.hasResult) {
    currentJob.resultHash =
      '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12';
    currentJob.result =
      'Dashboard complete! Live URL: https://defi-dashboard.vercel.app';
  }

  const currentEvents = createScenarioEvents(selectedScenario.id);

  const mockSessionKeys = {
    [`${mockAddress}-${mockWorkerAddress}`]: 'mock-session-key-1',
    [`${mockWorkerAddress}-${mockAddress}`]: 'mock-session-key-2',
    [`${mockAddress}-${mockArbitratorAddress}`]: 'mock-session-key-3',
    [`${mockWorkerAddress}-${mockArbitratorAddress}`]: 'mock-session-key-4',
    [`${mockArbitratorAddress}-${mockAddress}`]: 'mock-session-key-5',
    [`${mockArbitratorAddress}-${mockWorkerAddress}`]: 'mock-session-key-6',
  };

  const showChatList =
    userRole === 'creator' && currentJob.state === JobState.Open;

  // Mock the current user for components that need it
  const currentUser = mockUsers[currentAddress];

  return (
    <Layout borderless>
      {/* Enhanced Control Bar */}
      <div className='mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex flex-col gap-3'>
          {/* Scenario Selector */}
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
              Scenario:
            </span>
            <div className='flex flex-wrap gap-2'>
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario)}
                  className={clsx(
                    'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                    selectedScenario.id === scenario.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  )}
                >
                  {scenario.label}
                </button>
              ))}
            </div>
          </div>

          {/* Role Selector and State Info */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                View as:
              </span>
              <div className='flex gap-2'>
                {(['creator', 'worker', 'arbitrator'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRole(role)}
                    className={clsx(
                      'rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-all',
                      userRole === role
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Current State Badge */}
            <div className='flex items-center gap-3'>
              <span className='text-sm text-gray-500'>State:</span>
              <span className='rounded-md bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                {JobState[currentJob.state]}
              </span>
              {currentJob.disputed && (
                <span className='rounded-md bg-red-100 px-3 py-1 text-sm font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400'>
                  Disputed
                </span>
              )}
              <span className='rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300'>
                {currentEvents.length} events
              </span>
            </div>
          </div>

          {/* Current User Info */}
          <div className='flex items-center gap-3 rounded-md bg-gray-50 p-2 dark:bg-gray-900'>
            <span className='text-xs text-gray-500'>Current User:</span>
            <div className='flex items-center gap-2'>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className='h-6 w-6 rounded-full'
              />
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                {currentUser.name}
              </span>
              <span className='text-xs text-gray-500'>
                ({currentAddress.slice(0, 6)}...{currentAddress.slice(-4)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Job Interface */}
      <div className='h-[calc(100vh-16rem)]'>
        <div className='grid h-full grid-cols-2 md:grid-cols-4'>
          {/* Chat List */}
          {showChatList && (
            <div className='col-span-1 hidden h-full overflow-y-auto border border-gray-100 bg-white p-3 md:block'>
              <JobChatsList
                users={mockUsers}
                job={currentJob}
                setSelectedWorker={setSelectedWorker}
              />
            </div>
          )}

          {/* Main Chat Area */}
          <div
            className={clsx(
              (currentJob.state === JobState.Open && !showChatList) ||
                currentJob.state === JobState.Taken ||
                currentJob.state === JobState.Closed
                ? 'col-span-3'
                : 'col-span-2',
              'h-full bg-white'
            )}
          >
            <div className='flex h-full flex-col'>
              {/* Mobile Menu */}
              <div className='h-[74px] shrink-0'>
                <OpenJobMobileMenu
                  users={mockUsers}
                  selectedWorker={selectedWorker}
                  eventMessages={currentEvents}
                  address={currentAddress as `0x${string}`}
                  job={currentJob}
                  events={currentEvents}
                  addresses={Object.keys(mockUsers)}
                  sessionKeys={mockSessionKeys}
                  jobMeceTag='Development'
                  timePassed={false}
                  adjustedProgressValue={50}
                  tokenIcon={tokenIcon}
                  setSelectedWorker={setSelectedWorker}
                  whitelistedWorkers={[]}
                  user={currentUser}
                />
              </div>

              {/* Chat Events - Pass users and currentUser directly */}
              <div className='flex-1 overflow-y-auto'>
                <JobChatEvents
                  job={currentJob}
                  events={currentEvents}
                  users={mockUsers}
                  selectedWorker={selectedWorker}
                  address={currentAddress}
                  currentUser={currentUser}
                />
              </div>

              {/* Post Message Button - Mock implementation for testing */}
              {currentJob &&
                (currentJob.state === JobState.Open ||
                  currentJob.state === JobState.Taken) && (
                  <div className='h-[80px] shrink-0 border border-gray-100'>
                    <div className='flex h-full items-center justify-center p-4'>
                      <div className='w-full'>
                        <div className='flex items-end gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm'>
                          <textarea
                            rows={1}
                            placeholder='Type a message...'
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
                  </div>
                )}
            </div>
          </div>

          {/* Sidebar */}
          <div className='hidden h-full overflow-y-auto md:block'>
            <JobSidebar
              job={currentJob}
              address={currentAddress as `0x${string}`}
              events={currentEvents}
              addresses={Object.keys(mockUsers)}
              sessionKeys={mockSessionKeys}
              users={mockUsers}
              jobMeceTag='Development'
              timePassed={false}
              adjustedProgressValue={50}
              whitelistedWorkers={[]}
              tokenIcon={tokenIcon}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
