'use client';

import { useState } from 'react';
import { Layout } from '@/components/Dashboard/Layout';
import JobChatEvents from '@/app/dashboard/jobs/[id]/JobChat/JobChatEvents';
import JobChatsList from '@/app/dashboard/jobs/[id]/JobChatsList';
import JobSidebar from '@/app/dashboard/jobs/[id]/JobSidebar';
import JobButtonActions from '@/app/dashboard/jobs/[id]/JobButtonActions';
import JobStatusWrapper from '@/app/dashboard/jobs/[id]/JobStatusWrapper';
import OpenJobMobileMenu from '@/app/dashboard/jobs/[id]/JobChat/OpenJobMobileMenu';
import { PostMessageButton } from '@/components/JobActions/PostMessageButton';

// Status State Components
import AssignWorker from '@/app/dashboard/jobs/[id]/JobChat/StatusStates/AssignWorker';
import WorkerAccepted from '@/app/dashboard/jobs/[id]/JobChat/StatusStates/WorkerAccepted';
import ResultVerification from '@/app/dashboard/jobs/[id]/JobChat/StatusStates/ResultVerification';
import ResultAccepted from '@/app/dashboard/jobs/[id]/JobChat/StatusStates/ResultAccepted';
import DisputeStarted from '@/app/dashboard/jobs/[id]/JobChat/StatusStates/DisputeStarted';
import ArbitratedStatus from '@/app/dashboard/jobs/[id]/JobChat/StatusStates/ArbitratedStatus';

import {
  Job,
  JobState,
  JobEventType,
  type JobEventWithDiffs,
  type User,
} from '@effectiveacceleration/contracts';
import { zeroAddress, zeroHash, toHex } from 'viem';
import { tokenIcon } from '@/lib/tokens';
import clsx from 'clsx';

// Mock data generators
const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
const mockWorkerAddress = '0x5aeda56215b167893e80b4fe645ba6d5bab767de';
const mockArbitratorAddress = '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199';

const createMockUser = (address: string, name: string): User => ({
  address_: address,
  publicKey: 'mock-public-key-' + address.slice(0, 8),
  name: name,
  bio: 'Experienced developer specializing in blockchain and web3 technologies',
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
  reputationUp: 15,
  reputationDown: 2,
});

const createMockJob = (state: JobState, disputed: boolean = false): Job => ({
  id: '1',
  state: state,
  title: 'Build a DeFi Dashboard with Real-time Analytics',
  content:
    'We need an experienced developer to create a comprehensive DeFi dashboard that tracks multiple protocols, displays real-time analytics, and provides portfolio management features. The dashboard should be responsive, include dark mode, and integrate with major DeFi protocols.',
  contentHash:
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  tags: ['defi', 'react', 'web3', 'typescript', 'analytics'],
  token: '0x0000000000000000000000000000000000000000',
  amount: BigInt('1000000000000000000'), // 1 ETH - Ensure this is always BigInt
  maxTime: 604800, // 7 days in seconds
  deliveryMethod: 'IPFS',
  collateralOwed: BigInt('0'), // Ensure BigInt
  escrowId: BigInt('1'), // Ensure BigInt
  resultHash:
    state === JobState.Taken && !disputed
      ? '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12'
      : zeroHash,
  rating: 0,
  disputed: disputed,
  timestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
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
    arbitratedAt: 0,
    updatedAt: Math.floor(Date.now() / 1000) - 3600,
    lastEventAt: Math.floor(Date.now() / 1000) - 1800,
  },
  whitelistWorkers: false,
  multipleApplicants: false,
  allowedWorkers: [],
});

// Helper function to create valid event data based on event type
const getEventData = (type: JobEventType): string => {
  switch (type) {
    case JobEventType.Taken:
      // For Taken events, data_ should be the escrowId as hex
      return toHex(BigInt('1')); // escrowId = 1 - Ensure BigInt
    case JobEventType.Delivered:
      // For Delivered events, data_ might contain result hash
      return '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12';
    case JobEventType.Completed:
    case JobEventType.Rated:
      // For rating events, could contain the rating value
      return toHex(BigInt('5')); // rating = 5 - Ensure BigInt
    case JobEventType.CollateralWithdrawn:
      // For collateral events, the amount
      return toHex(BigInt('1000000000000000000')); // Ensure BigInt
    case JobEventType.Arbitrated:
      // For arbitration, could encode the decision
      return toHex(BigInt('1')); // 1 = worker wins - Ensure BigInt
    default:
      // For most events, empty data is fine but needs to be valid hex
      return '0x00';
  }
};

// Create comprehensive mock events showing all event types
const createMockEventWithAddress = (
  type: JobEventType,
  address: string,
  details?: any,
  diffs?: any[]
): JobEventWithDiffs => ({
  id: Math.random().toString(),
  jobId: BigInt('1'), // Ensure BigInt
  type_: type,
  address_: address,
  data_: getEventData(type), // Use proper data based on event type
  timestamp_: Math.floor(Date.now() / 1000) - Math.random() * 86400,
  job: createMockJob(JobState.Open),
  details: details || {},
  diffs: diffs || [],
});

// Comprehensive event list with all types
const allEventTypes: JobEventWithDiffs[] = [
  // Job lifecycle events
  createMockEventWithAddress(JobEventType.Created, mockAddress, {}, [
    {
      field: 'title',
      oldValue: '',
      newValue: 'Build a DeFi Dashboard with Real-time Analytics',
    },
    { field: 'amount', oldValue: '0', newValue: '1000000000000000000' },
    { field: 'state', oldValue: 'None', newValue: 'Open' },
  ]),

  createMockEventWithAddress(JobEventType.Updated, mockAddress, {}, [
    {
      field: 'content',
      oldValue: 'Initial description',
      newValue: 'Updated with more details about requirements',
    },
    {
      field: 'tags',
      oldValue: '["defi"]',
      newValue: '["defi", "react", "web3", "typescript"]',
    },
    { field: 'maxTime', oldValue: '259200', newValue: '604800' }, // 3 days to 7 days
  ]),

  // Worker application messages
  createMockEventWithAddress(JobEventType.WorkerMessage, mockWorkerAddress, {
    recipientAddress: mockAddress,
    message:
      "Hi! I'm interested in this job. I have 5 years of experience with DeFi dashboards. Here's my portfolio: https://myportfolio.com",
  }),

  createMockEventWithAddress(JobEventType.OwnerMessage, mockAddress, {
    recipientAddress: mockWorkerAddress,
    message:
      'Great portfolio! Can you tell me more about your experience with real-time data streaming?',
  }),

  createMockEventWithAddress(JobEventType.WorkerMessage, mockWorkerAddress, {
    recipientAddress: mockAddress,
    message:
      "I've worked extensively with WebSockets and GraphQL subscriptions for real-time updates. I built a similar dashboard for tracking DEX trades across multiple chains.",
  }),

  // Job taken
  createMockEventWithAddress(JobEventType.Taken, mockWorkerAddress, {}, [
    { field: 'state', oldValue: 'Open', newValue: 'Taken' },
    {
      field: 'roles.worker',
      oldValue: zeroAddress,
      newValue: mockWorkerAddress,
    },
    {
      field: 'jobTimes.assignedAt',
      oldValue: '0',
      newValue: String(Math.floor(Date.now() / 1000)),
    },
  ]),

  // Progress updates
  createMockEventWithAddress(JobEventType.WorkerMessage, mockWorkerAddress, {
    message:
      "Quick update: I've completed the basic dashboard layout and integrated with Uniswap V3. Working on the portfolio tracking feature now.",
  }),

  createMockEventWithAddress(JobEventType.OwnerMessage, mockAddress, {
    message: 'Looks great so far! Can you also add support for Curve pools?',
  }),

  createMockEventWithAddress(JobEventType.WorkerMessage, mockWorkerAddress, {
    message: "Sure, I'll add Curve integration. Should be done by tomorrow.",
  }),

  // Delivery
  createMockEventWithAddress(
    JobEventType.Delivered,
    mockWorkerAddress,
    {
      result:
        'Dashboard complete! 🎉\n\nLive URL: https://defi-dashboard.vercel.app\n\nFeatures implemented:\n✅ Real-time price tracking\n✅ Portfolio analytics with P&L\n✅ Multi-protocol support (Uniswap, Curve, Aave)\n✅ Dark/Light mode\n✅ Responsive design\n✅ Export to CSV\n\nGitHub repo: https://github.com/example/defi-dashboard\n\nAdmin credentials:\n- Username: admin@example.com\n- Password: SecurePass123!\n\nThe dashboard updates every 5 seconds and includes historical charts for the past 30 days.',
    },
    [
      {
        field: 'resultHash',
        oldValue: zeroHash,
        newValue:
          '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12',
      },
      {
        field: 'jobTimes.deliveredAt',
        oldValue: '0',
        newValue: String(Math.floor(Date.now() / 1000)),
      },
    ]
  ),

  // Completion and rating
  createMockEventWithAddress(JobEventType.Completed, mockAddress, {}, [
    { field: 'state', oldValue: 'Taken', newValue: 'Closed' },
    {
      field: 'jobTimes.completedAt',
      oldValue: '0',
      newValue: String(Math.floor(Date.now() / 1000)),
    },
  ]),

  createMockEventWithAddress(
    JobEventType.Rated,
    mockAddress,
    {
      rating: 5,
      review:
        'Excellent work! The dashboard exceeded expectations. Clean code, great documentation, and the real-time updates are incredibly smooth. Will definitely hire again!',
    },
    [{ field: 'rating', oldValue: '0', newValue: '5' }]
  ),

  // Additional event types for dispute scenario
  createMockEventWithAddress(
    JobEventType.Disputed,
    mockAddress,
    {
      reason:
        "The delivered dashboard is missing several key features that were specified in the requirements. The Aave integration doesn't work properly and there's no CSV export functionality.",
    },
    [
      { field: 'disputed', oldValue: 'false', newValue: 'true' },
      {
        field: 'jobTimes.disputedAt',
        oldValue: '0',
        newValue: String(Math.floor(Date.now() / 1000)),
      },
    ]
  ),

  // Arbitrator joins the conversation (arbitrator sends as owner message to worker)
  createMockEventWithAddress(JobEventType.OwnerMessage, mockArbitratorAddress, {
    recipientAddress: mockWorkerAddress,
    message:
      "Hello both parties. I've reviewed the initial complaint. @Worker, can you provide evidence that the Aave integration and CSV export were implemented?",
  }),

  createMockEventWithAddress(JobEventType.WorkerMessage, mockWorkerAddress, {
    recipientAddress: mockArbitratorAddress,
    message:
      "The Aave integration is working - you can see it on the /protocols page. The CSV export button is in the top-right corner of the portfolio section. Here's a video walkthrough: https://example.com/demo.mp4",
  }),

  createMockEventWithAddress(JobEventType.OwnerMessage, mockArbitratorAddress, {
    recipientAddress: mockAddress,
    message:
      "@Creator, I've tested the features and they appear to be working. Can you clarify what specific issues you're experiencing?",
  }),

  createMockEventWithAddress(JobEventType.OwnerMessage, mockAddress, {
    message:
      'I see now - I was looking in the wrong place. However, the CSV export only includes basic data, not the detailed transaction history we discussed.',
  }),

  // Arbitration decision
  createMockEventWithAddress(
    JobEventType.Arbitrated,
    mockArbitratorAddress,
    {
      creatorAmount: BigInt('200000000000000000'), // 0.2 ETH refund - Ensure BigInt
      workerAmount: BigInt('800000000000000000'), // 0.8 ETH to worker - Ensure BigInt
      reason:
        'After reviewing the evidence and testing the application, I find that the worker has delivered most of the requirements. The CSV export functionality is present but limited. Awarding 80% to the worker and 20% refund to the creator for the incomplete export feature.',
    },
    [
      { field: 'state', oldValue: 'Taken', newValue: 'Closed' },
      { field: 'disputed', oldValue: 'true', newValue: 'false' },
      {
        field: 'jobTimes.arbitratedAt',
        oldValue: '0',
        newValue: String(Math.floor(Date.now() / 1000)),
      },
    ]
  ),

  // Additional event types
  createMockEventWithAddress(JobEventType.Refunded, mockWorkerAddress, {}, [
    { field: 'state', oldValue: 'Taken', newValue: 'Open' },
    {
      field: 'roles.worker',
      oldValue: mockWorkerAddress,
      newValue: zeroAddress,
    },
  ]),

  createMockEventWithAddress(JobEventType.Closed, mockAddress, {}, [
    { field: 'state', oldValue: 'Open', newValue: 'Closed' },
    {
      field: 'jobTimes.closedAt',
      oldValue: '0',
      newValue: String(Math.floor(Date.now() / 1000)),
    },
  ]),

  createMockEventWithAddress(JobEventType.Reopened, mockAddress, {}, [
    { field: 'state', oldValue: 'Closed', newValue: 'Open' },
  ]),

  createMockEventWithAddress(
    JobEventType.WhitelistedWorkerAdded,
    mockAddress,
    {
      addresses: [
        mockWorkerAddress,
        '0x1234567890123456789012345678901234567890',
      ],
    },
    [
      { field: 'whitelistWorkers', oldValue: 'false', newValue: 'true' },
      {
        field: 'allowedWorkers',
        oldValue: '[]',
        newValue: '[0x5aed..., 0x1234...]',
      },
    ]
  ),

  createMockEventWithAddress(
    JobEventType.WhitelistedWorkerRemoved,
    mockAddress,
    {
      addresses: ['0x1234567890123456789012345678901234567890'],
    },
    [
      {
        field: 'allowedWorkers',
        oldValue: '[0x5aed..., 0x1234...]',
        newValue: '[0x5aed...]',
      },
    ]
  ),

  createMockEventWithAddress(
    JobEventType.CollateralWithdrawn,
    mockAddress,
    {
      amount: BigInt('1000000000000000000'), // Ensure BigInt
    },
    [
      {
        field: 'collateralOwed',
        oldValue: '1000000000000000000',
        newValue: '0',
      },
    ]
  ),
];

// Create scenario-specific events by filtering the comprehensive list
const mockEvents: { [key: string]: JobEventWithDiffs[] } = {
  open: allEventTypes
    .filter((e) =>
      [
        JobEventType.Created,
        JobEventType.Updated,
        JobEventType.WorkerMessage,
        JobEventType.OwnerMessage,
        JobEventType.WhitelistedWorkerAdded,
      ].includes(e.type_)
    )
    .slice(0, 8),

  taken: allEventTypes
    .filter((e) =>
      [
        JobEventType.Created,
        JobEventType.Taken,
        JobEventType.WorkerMessage,
        JobEventType.OwnerMessage,
      ].includes(e.type_)
    )
    .slice(0, 10),

  delivered: allEventTypes
    .filter((e) =>
      [
        JobEventType.Created,
        JobEventType.Taken,
        JobEventType.Delivered,
        JobEventType.WorkerMessage,
        JobEventType.OwnerMessage,
      ].includes(e.type_)
    )
    .slice(0, 10),

  completed: allEventTypes.filter((e) =>
    [
      JobEventType.Created,
      JobEventType.Taken,
      JobEventType.Delivered,
      JobEventType.Completed,
      JobEventType.Rated,
    ].includes(e.type_)
  ),

  disputed: allEventTypes
    .filter((e) =>
      [
        JobEventType.Created,
        JobEventType.Taken,
        JobEventType.Delivered,
        JobEventType.Disputed,
        JobEventType.WorkerMessage,
        JobEventType.OwnerMessage,
      ].includes(e.type_)
    )
    .slice(0, 15),

  arbitrated: allEventTypes.filter((e) =>
    [
      JobEventType.Created,
      JobEventType.Taken,
      JobEventType.Disputed,
      JobEventType.OwnerMessage,
      JobEventType.WorkerMessage,
      JobEventType.Arbitrated,
    ].includes(e.type_)
  ),

  // Special: show ALL events
  all: allEventTypes,
};

const mockUsers: Record<string, User> = {
  [mockAddress]: createMockUser(mockAddress, 'Alice (Creator)'),
  [mockWorkerAddress]: createMockUser(mockWorkerAddress, 'Bob (Worker)'),
  [mockArbitratorAddress]: createMockUser(
    mockArbitratorAddress,
    'Charlie (Arbitrator)'
  ),
};

// Test scenarios
const scenarios = [
  {
    id: 'all',
    label: 'All Events (Full Timeline)',
    state: JobState.Closed,
    disputed: false,
    hasResult: true,
  },
  { id: 'open', label: 'Open Job', state: JobState.Open, disputed: false },
  {
    id: 'taken',
    label: 'Job Taken (In Progress)',
    state: JobState.Taken,
    disputed: false,
  },
  {
    id: 'delivered',
    label: 'Work Delivered',
    state: JobState.Taken,
    disputed: false,
    hasResult: true,
  },
  {
    id: 'completed',
    label: 'Job Completed',
    state: JobState.Closed,
    disputed: false,
    hasResult: true,
  },
  {
    id: 'disputed',
    label: 'Dispute Started',
    state: JobState.Taken,
    disputed: true,
  },
  {
    id: 'arbitrated',
    label: 'Arbitration Complete',
    state: JobState.Closed,
    disputed: true,
  },
];

export default function JobTestPage() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [selectedWorker, setSelectedWorker] = useState(mockWorkerAddress);
  const [userRole, setUserRole] = useState<'creator' | 'worker' | 'arbitrator'>(
    'creator'
  );

  // Get current user address based on role
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

  // Create job based on selected scenario
  const currentJob = createMockJob(
    selectedScenario.state,
    selectedScenario.disputed
  );
  if (selectedScenario.hasResult) {
    currentJob.resultHash =
      '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12';
  }

  const currentEvents = mockEvents[selectedScenario.id] || mockEvents.open;

  const mockSessionKeys = {
    [`${mockAddress}-${mockWorkerAddress}`]: 'mock-session-key-1',
    [`${mockWorkerAddress}-${mockAddress}`]: 'mock-session-key-2',
    [`${mockAddress}-${mockArbitratorAddress}`]: 'mock-session-key-3',
  };

  const showChatList =
    userRole === 'creator' && currentJob.state === JobState.Open;

  return (
    <Layout borderless>
      {/* Control Panel */}
      <div className='mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
        <h2 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
          Test Controls
        </h2>

        {/* Scenario Selection */}
        <div className='mb-6'>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Select Job State Scenario
          </label>
          <div className='grid grid-cols-2 gap-2 md:grid-cols-3'>
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario)}
                className={clsx(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  selectedScenario.id === scenario.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                )}
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        {/* User Role Selection */}
        <div className='mb-6'>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            View As User Role
          </label>
          <div className='flex gap-2'>
            {(['creator', 'worker', 'arbitrator'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setUserRole(role)}
                className={clsx(
                  'rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all',
                  userRole === role
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Current State Info */}
        <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-900'>
          <h3 className='mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
            Current Test State
          </h3>
          <div className='grid grid-cols-2 gap-3 text-xs md:grid-cols-4'>
            <div>
              <span className='font-medium text-gray-500'>Job State:</span>
              <span className='ml-2 font-semibold text-gray-900 dark:text-gray-100'>
                {JobState[currentJob.state]}
              </span>
            </div>
            <div>
              <span className='font-medium text-gray-500'>Disputed:</span>
              <span className='ml-2 font-semibold text-gray-900 dark:text-gray-100'>
                {currentJob.disputed ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className='font-medium text-gray-500'>Result Hash:</span>
              <span className='ml-2 font-mono font-semibold text-gray-900 dark:text-gray-100'>
                {currentJob.resultHash === zeroHash ? 'None' : '0x123...'}
              </span>
            </div>
            <div>
              <span className='font-medium text-gray-500'>Current User:</span>
              <span className='ml-2 font-semibold capitalize text-gray-900 dark:text-gray-100'>
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Job View - Fixed height to use full viewport */}
      <div className='h-[calc(100vh-24rem)]'>
        <div className='grid h-full grid-cols-2 md:grid-cols-4'>
          {/* Chat List (for creator on open jobs) */}
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
              {/* Mobile Menu - Fixed height */}
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
                  user={mockUsers[currentAddress]}
                />
              </div>

              {/* Chat Events - Takes remaining space */}
              <div className='flex-1 overflow-y-auto border border-gray-100 bg-softBlue p-4'>
                <JobChatEvents
                  users={mockUsers}
                  selectedWorker={selectedWorker}
                  events={currentEvents}
                  job={currentJob}
                  address={currentAddress}
                />
              </div>

              {/* Post Message Button - Fixed height */}
              {currentJob &&
                (currentJob.state === JobState.Open ||
                  currentJob.state === JobState.Taken) && (
                  <div className='h-[80px] shrink-0 border border-gray-100'>
                    <div className='flex h-full items-center justify-center'>
                      <PostMessageButton
                        address={currentAddress}
                        recipient={selectedWorker}
                        addresses={Object.keys(mockUsers)}
                        sessionKeys={mockSessionKeys}
                        job={currentJob}
                      />
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

      {/* Status States Showcase - All visible for testing */}
      <div className='mt-8 space-y-6'>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
          Status States Component Showcase
        </h2>

        {/* Current Active Status */}
        <div className='rounded-xl border-2 border-blue-500 bg-white p-6 shadow-lg dark:bg-gray-800'>
          <h3 className='mb-4 text-sm font-medium text-blue-600 dark:text-blue-400'>
            Current Active Status for Selected Scenario
          </h3>

          {/* Status Wrapper */}
          <div className='mb-6'>
            <JobStatusWrapper
              job={currentJob}
              events={currentEvents}
              address={currentAddress}
              zeroHash={zeroHash}
              addresses={Object.keys(mockUsers)}
              sessionKeys={mockSessionKeys}
            />
          </div>

          {/* Button Actions */}
          <div className='mb-6'>
            <JobButtonActions
              job={currentJob}
              address={currentAddress}
              sessionKeys={mockSessionKeys}
              addresses={Object.keys(mockUsers)}
              events={currentEvents}
              whitelistedWorkers={[]}
              timePassed={false}
            />
          </div>

          {/* Active Status State Component */}
          <div>
            {selectedScenario.id === 'open' && userRole === 'creator' && (
              <AssignWorker
                job={currentJob}
                address={currentAddress}
                selectedWorker={selectedWorker}
                users={mockUsers}
              />
            )}

            {selectedScenario.id === 'taken' && (
              <WorkerAccepted
                job={currentJob}
                address={currentAddress}
                users={mockUsers}
              />
            )}

            {selectedScenario.id === 'delivered' && (
              <ResultVerification
                job={currentJob}
                users={mockUsers}
                selectedWorker={selectedWorker}
                events={currentEvents}
                address={currentAddress}
                sessionKeys={mockSessionKeys}
                addresses={Object.keys(mockUsers)}
              />
            )}

            {selectedScenario.id === 'completed' && (
              <ResultAccepted
                job={currentJob}
                events={currentEvents}
                users={mockUsers}
                selectedWorker={selectedWorker}
              />
            )}

            {selectedScenario.id === 'disputed' && (
              <DisputeStarted
                job={currentJob}
                address={currentAddress}
                users={mockUsers}
              />
            )}

            {selectedScenario.id === 'arbitrated' && (
              <ArbitratedStatus
                job={currentJob}
                events={currentEvents}
                users={mockUsers}
                selectedWorker={selectedWorker}
                address={currentAddress}
              />
            )}
          </div>
        </div>

        {/* All Status States Preview Grid */}
        <div>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            All Status State Components Preview
          </h3>
          <div className='grid gap-6 lg:grid-cols-2'>
            <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
              <h4 className='mb-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                Assign Worker State
              </h4>
              <AssignWorker
                job={createMockJob(JobState.Open)}
                address={mockAddress}
                selectedWorker={mockWorkerAddress}
                users={mockUsers}
              />
            </div>

            <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
              <h4 className='mb-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                Worker Accepted State
              </h4>
              <WorkerAccepted
                job={createMockJob(JobState.Taken)}
                address={mockAddress}
                users={mockUsers}
              />
            </div>

            <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
              <h4 className='mb-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                Result Verification State
              </h4>
              <ResultVerification
                job={{
                  ...createMockJob(JobState.Taken),
                  resultHash:
                    '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12',
                }}
                users={mockUsers}
                selectedWorker={mockWorkerAddress}
                events={mockEvents.delivered}
                address={mockAddress}
                sessionKeys={mockSessionKeys}
                addresses={Object.keys(mockUsers)}
              />
            </div>

            <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
              <h4 className='mb-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                Result Accepted State
              </h4>
              <ResultAccepted
                job={createMockJob(JobState.Closed)}
                events={mockEvents.completed}
                users={mockUsers}
                selectedWorker={mockWorkerAddress}
              />
            </div>

            <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
              <h4 className='mb-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                Dispute Started State
              </h4>
              <DisputeStarted
                job={{ ...createMockJob(JobState.Taken), disputed: true }}
                address={mockAddress}
                users={mockUsers}
              />
            </div>

            <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
              <h4 className='mb-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                Arbitration Complete State
              </h4>
              <ArbitratedStatus
                job={createMockJob(JobState.Closed, true)}
                events={mockEvents.arbitrated}
                users={mockUsers}
                selectedWorker={mockWorkerAddress}
                address={mockAddress}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
