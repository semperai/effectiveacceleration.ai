import React from 'react';
import { clsx } from 'clsx';
import { zeroAddress, zeroHash, toHex } from 'viem';
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
} from '@effectiveacceleration/contracts';
import {
  FCFSAvailable,
  AssignWorker,
  WorkerAccepted,
  ResultVerification,
  ResultAccepted,
  DisputeStarted,
  ArbitratedStatus,
} from './JobChat/StatusStates';

// ============ MOCK DATA ============
export const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
export const mockWorkerAddress = '0x5aeda56215b167893e80b4fe645ba6d5bab767de';
export const mockWorkerAddress2 = '0x6aeda56215b167893e80b4fe645ba6d5bab767df';
export const mockArbitratorAddress =
  '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199';

// ============ SCENARIOS ============
export const scenarios = [
  { id: 'all', label: 'All', state: JobState.Closed, fullLabel: 'All Events' },
  { id: 'open', label: 'Open', state: JobState.Open, fullLabel: 'Open' },
  {
    id: 'taken',
    label: 'Taken',
    state: JobState.Taken,
    fullLabel: 'In Progress',
  },
  {
    id: 'delivered',
    label: 'Delivered',
    state: JobState.Taken,
    hasResult: true,
    fullLabel: 'Delivered',
  },
  {
    id: 'completed',
    label: 'Complete',
    state: JobState.Closed,
    fullLabel: 'Completed',
  },
  {
    id: 'disputed',
    label: 'Disputed',
    state: JobState.Taken,
    disputed: true,
    fullLabel: 'Disputed',
  },
];

// ============ JOB MODES ============
export const jobModes = [
  { id: 'multiple', label: 'Multiple Applicants', value: true },
  { id: 'fcfs', label: 'FCFS (First Come)', value: false },
];

// ============ USER CREATION ============
export const createMockUser = (
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

export const mockUsers: Record<string, User> = {
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

// ============ JOB CREATION ============
export const createMockJob = (
  state: JobState,
  disputed: boolean = false,
  multipleApplicants: boolean = true
): Job => ({
  id: '1',
  state: state,
  title: multipleApplicants
    ? 'Build a DeFi Dashboard with Real-time Analytics'
    : '⚡ URGENT: Fix Critical Smart Contract Bug',
  content: multipleApplicants
    ? 'We need an experienced developer to create a comprehensive DeFi dashboard that tracks multiple protocols, displays real-time analytics, and provides portfolio management features.'
    : '🚨 IMMEDIATE HELP NEEDED: Critical bug in our staking contract needs fixing ASAP. First qualified developer to apply gets the job instantly!',
  contentHash:
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  tags: multipleApplicants
    ? ['defi', 'react', 'web3', 'typescript', 'analytics']
    : ['urgent', 'solidity', 'bug-fix', 'smart-contract', 'fcfs'],
  token: '0x0000000000000000000000000000000000000000',
  amount: BigInt('1000000000000000000'),
  maxTime: multipleApplicants ? 604800 : 172800, // 7 days vs 2 days for urgent
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
  multipleApplicants: multipleApplicants,
  allowedWorkers: [],
  result: '',
});

// ============ EVENT CREATION ============
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

// Event timestamp management
let eventTimestamp = Math.floor(Date.now() / 1000) - 259200;
const getNextTimestamp = () => {
  eventTimestamp += Math.floor(Math.random() * 3600) + 1800;
  return eventTimestamp;
};

export const createMockEvent = (
  type: JobEventType,
  address: string,
  details?: any,
  diffs?: any[],
  multipleApplicants: boolean = true
): JobEventWithDiffs => {
  const eventJob = createMockJob(JobState.Open, false, multipleApplicants);

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

// ============ SCENARIO GENERATION ============
export const createScenarioEvents = (
  scenario: string,
  multipleApplicants: boolean = true
): JobEventWithDiffs[] => {
  // Reset timestamp for consistent ordering
  eventTimestamp = Math.floor(Date.now() / 1000) - 259200;

  const baseEvents = [
    createMockEvent(
      JobEventType.Created,
      mockAddress,
      {},
      [
        { field: 'state', oldValue: null, newValue: 'Open' },
        {
          field: 'title',
          oldValue: null,
          newValue: multipleApplicants
            ? 'Build a DeFi Dashboard with Real-time Analytics'
            : '⚡ URGENT: Fix Critical Smart Contract Bug',
        },
        {
          field: 'multipleApplicants',
          oldValue: null,
          newValue: multipleApplicants,
        },
      ],
      multipleApplicants
    ),
  ];

  switch (scenario) {
    case 'all':
      // Comprehensive scenario with ALL event types
      return [
        // 1. Job Creation
        createMockEvent(
          JobEventType.Created,
          mockAddress,
          {},
          [
            { field: 'state', oldValue: null, newValue: 'Open' },
            {
              field: 'title',
              oldValue: null,
              newValue: multipleApplicants
                ? 'Build a DeFi Dashboard'
                : '⚡ URGENT: Fix Critical Bug',
            },
            {
              field: 'multipleApplicants',
              oldValue: null,
              newValue: multipleApplicants,
            },
          ],
          multipleApplicants
        ),

        // 2. Job Update
        createMockEvent(
          JobEventType.Updated,
          mockAddress,
          {},
          [
            {
              field: 'amount',
              oldValue: '1000000000000000000',
              newValue: '1500000000000000000',
            },
            { field: 'maxTime', oldValue: '604800', newValue: '1209600' },
          ],
          multipleApplicants
        ),

        // For FCFS jobs, skip the application messages and go straight to taken
        ...(multipleApplicants
          ? [
              // 3-4. Worker and Owner Messages (only for multiple applicants)
              createMockEvent(
                JobEventType.WorkerMessage,
                mockWorkerAddress,
                {
                  content:
                    'Hi! I have 5 years of experience with DeFi dashboards. Check my portfolio: https://mywork.dev',
                  recipientAddress: mockAddress,
                } as JobMessageEvent,
                [],
                multipleApplicants
              ),

              createMockEvent(
                JobEventType.OwnerMessage,
                mockAddress,
                {
                  content: 'Great portfolio! When can you start?',
                  recipientAddress: mockWorkerAddress,
                } as JobMessageEvent,
                [],
                multipleApplicants
              ),
            ]
          : [
              // For FCFS: Worker directly takes the job
              createMockEvent(
                JobEventType.WorkerMessage,
                mockWorkerAddress,
                {
                  content:
                    'Taking this urgent job! I can fix this bug immediately.',
                  recipientAddress: mockAddress,
                } as JobMessageEvent,
                [],
                multipleApplicants
              ),
            ]),

        // Job lifecycle continues...
        createMockEvent(
          JobEventType.Taken,
          mockWorkerAddress,
          {},
          [
            { field: 'state', oldValue: 'Open', newValue: 'Taken' },
            {
              field: 'roles.worker',
              oldValue: null,
              newValue: mockWorkerAddress,
            },
          ],
          multipleApplicants
        ),

        createMockEvent(
          JobEventType.Signed,
          mockWorkerAddress,
          {},
          [{ field: 'signed', oldValue: false, newValue: true }],
          multipleApplicants
        ),

        createMockEvent(
          JobEventType.Paid,
          mockWorkerAddress,
          {},
          [
            {
              field: 'escrowBalance',
              oldValue: '0',
              newValue: '1500000000000000000',
            },
          ],
          multipleApplicants
        ),

        // Progress message
        createMockEvent(
          JobEventType.WorkerMessage,
          mockWorkerAddress,
          {
            content: multipleApplicants
              ? 'Started working on the dashboard. Setting up the development environment.'
              : 'Bug identified! Working on the fix now.',
            recipientAddress: mockAddress,
          } as JobMessageEvent,
          [],
          multipleApplicants
        ),

        // Delivery
        createMockEvent(
          JobEventType.Delivered,
          mockWorkerAddress,
          {
            result: multipleApplicants
              ? 'Dashboard complete! Live at: https://defi-dashboard.vercel.app\n\nFeatures implemented:\n- Multi-chain support\n- Real-time analytics\n- Portfolio tracking\n- Responsive design\n\nGitHub: https://github.com/example/defi-dashboard'
              : 'Bug fixed! The staking contract vulnerability has been patched.\n\nChanges made:\n- Fixed reentrancy vulnerability\n- Added proper access controls\n- Updated withdrawal logic\n\nPR: https://github.com/example/fix-critical-bug',
          },
          [],
          multipleApplicants
        ),

        // Rest of the events...
        createMockEvent(
          JobEventType.Completed,
          mockAddress,
          {},
          [{ field: 'state', oldValue: 'Taken', newValue: 'Closed' }],
          multipleApplicants
        ),

        createMockEvent(
          JobEventType.Rated,
          mockAddress,
          {
            rating: 5,
            review: multipleApplicants
              ? 'Excellent work on the dashboard!'
              : 'Lightning fast response and perfect fix! Saved our protocol!',
          } as JobRatedEvent,
          [],
          multipleApplicants
        ),
      ];

    case 'open':
      if (multipleApplicants) {
        return [
          ...baseEvents,
          createMockEvent(
            JobEventType.WorkerMessage,
            mockWorkerAddress,
            {
              content:
                "Hi! I'm interested in this job. I have 5 years of experience.",
              recipientAddress: mockAddress,
            } as JobMessageEvent,
            [],
            multipleApplicants
          ),
          createMockEvent(
            JobEventType.OwnerMessage,
            mockAddress,
            {
              content: 'Great! Can you share your portfolio?',
              recipientAddress: mockWorkerAddress,
            } as JobMessageEvent,
            [],
            multipleApplicants
          ),
        ];
      } else {
        // FCFS job - just created, waiting for someone to take it
        return baseEvents;
      }

    case 'taken':
      return [
        ...baseEvents,
        ...(multipleApplicants
          ? [
              createMockEvent(
                JobEventType.WorkerMessage,
                mockWorkerAddress,
                {
                  content: "I'm interested in this job!",
                  recipientAddress: mockAddress,
                } as JobMessageEvent,
                [],
                multipleApplicants
              ),
            ]
          : []),
        createMockEvent(
          JobEventType.Taken,
          mockWorkerAddress,
          {},
          [
            { field: 'state', oldValue: 'Open', newValue: 'Taken' },
            {
              field: 'roles.worker',
              oldValue: null,
              newValue: mockWorkerAddress,
            },
          ],
          multipleApplicants
        ),
        createMockEvent(
          JobEventType.WorkerMessage,
          mockWorkerAddress,
          {
            content: multipleApplicants
              ? "I've started working on the dashboard. Will update you soon!"
              : 'Bug fix in progress. Should be done within the hour!',
            recipientAddress: mockAddress,
          } as JobMessageEvent,
          [],
          multipleApplicants
        ),
      ];

    case 'delivered':
      return [
        ...baseEvents,
        createMockEvent(
          JobEventType.Taken,
          mockWorkerAddress,
          {},
          [
            { field: 'state', oldValue: 'Open', newValue: 'Taken' },
            {
              field: 'roles.worker',
              oldValue: null,
              newValue: mockWorkerAddress,
            },
          ],
          multipleApplicants
        ),
        createMockEvent(
          JobEventType.Delivered,
          mockWorkerAddress,
          {
            result: multipleApplicants
              ? 'Dashboard complete! Live URL: https://defi-dashboard.vercel.app'
              : 'Critical bug fixed! Contract is now secure.',
          },
          [],
          multipleApplicants
        ),
      ];

    case 'completed':
      return [
        ...baseEvents,
        createMockEvent(
          JobEventType.Taken,
          mockWorkerAddress,
          {},
          [
            { field: 'state', oldValue: 'Open', newValue: 'Taken' },
            {
              field: 'roles.worker',
              oldValue: null,
              newValue: mockWorkerAddress,
            },
          ],
          multipleApplicants
        ),
        createMockEvent(
          JobEventType.Delivered,
          mockWorkerAddress,
          {
            result: 'Work completed successfully!',
          },
          [],
          multipleApplicants
        ),
        createMockEvent(
          JobEventType.Completed,
          mockAddress,
          {},
          [{ field: 'state', oldValue: 'Taken', newValue: 'Closed' }],
          multipleApplicants
        ),
        createMockEvent(
          JobEventType.Rated,
          mockAddress,
          {
            rating: 5,
            review: 'Excellent work!',
          } as JobRatedEvent,
          [],
          multipleApplicants
        ),
      ];

    case 'disputed':
      return [
        ...baseEvents,
        createMockEvent(
          JobEventType.Taken,
          mockWorkerAddress,
          {},
          [
            { field: 'state', oldValue: 'Open', newValue: 'Taken' },
            {
              field: 'roles.worker',
              oldValue: null,
              newValue: mockWorkerAddress,
            },
          ],
          multipleApplicants
        ),
        createMockEvent(
          JobEventType.Disputed,
          mockAddress,
          {
            content: 'The delivered work is incomplete.',
          } as JobDisputedEvent,
          [{ field: 'disputed', oldValue: false, newValue: true }],
          multipleApplicants
        ),
      ];

    default:
      return baseEvents;
  }
};

// ============ TEST DATA GENERATOR ============
export const generateTestData = (
  selectedScenario: any,
  testUserRole: string,
  multipleApplicants: boolean = true
) => {
  const testAddress =
    testUserRole === 'creator'
      ? mockAddress
      : testUserRole === 'worker'
        ? mockWorkerAddress
        : mockArbitratorAddress;

  const testJob = createMockJob(
    selectedScenario.state,
    selectedScenario.disputed,
    multipleApplicants
  );
  if (selectedScenario.hasResult) {
    testJob.resultHash =
      '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12';
    testJob.result = multipleApplicants
      ? 'Dashboard complete! Live URL: https://defi-dashboard.vercel.app'
      : 'Critical bug fixed! Contract is now secure.';
  }

  const testEvents = createScenarioEvents(
    selectedScenario.id,
    multipleApplicants
  );
  const testAddresses = Object.keys(mockUsers);
  const testSessionKeys = {
    [`${mockAddress}-${mockWorkerAddress}`]: 'mock-session-key-1',
    [`${mockWorkerAddress}-${mockAddress}`]: 'mock-session-key-2',
    [`${mockAddress}-${mockArbitratorAddress}`]: 'mock-session-key-3',
    [`${mockWorkerAddress}-${mockArbitratorAddress}`]: 'mock-session-key-4',
    [`${mockArbitratorAddress}-${mockAddress}`]: 'mock-session-key-5',
    [`${mockArbitratorAddress}-${mockWorkerAddress}`]: 'mock-session-key-6',
  };

  return {
    job: testJob,
    events: testEvents,
    addresses: testAddresses,
    sessionKeys: testSessionKeys,
    users: mockUsers,
    user: mockUsers[testAddress],
    address: testAddress,
  };
};

// ============ STATUS STATES ============
export const statusStates = [
  { id: 'none', label: 'None' },
  { id: 'fcfs', label: 'FCFS Available' },
  { id: 'assign', label: 'Assign Worker' },
  { id: 'accepted', label: 'Worker Accepted' },
  { id: 'verification', label: 'Result Verification' },
  { id: 'completed', label: 'Result Accepted' },
  { id: 'disputed', label: 'Dispute Started' },
  { id: 'arbitrated', label: 'Arbitration Complete' },
];

// ============ TEST CONTROL BAR COMPONENT ============
interface TestControlBarProps {
  selectedScenario: any;
  setSelectedScenario: (scenario: any) => void;
  userRole: string;
  setUserRole: (role: any) => void;
  currentJob: Job;
  selectedStatus?: string;
  setSelectedStatus?: (status: string) => void;
  multipleApplicants?: boolean;
  setMultipleApplicants?: (value: boolean) => void;
}

export const TestControlBar: React.FC<TestControlBarProps> = ({
  selectedScenario,
  setSelectedScenario,
  userRole,
  setUserRole,
  currentJob,
  selectedStatus = 'none',
  setSelectedStatus,
  multipleApplicants = true,
  setMultipleApplicants,
}) => (
  <div className='sticky top-0 z-50 mb-2 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95'>
    {/* Outer container with overflow-x-auto for horizontal scrolling */}
    <div className='overflow-x-auto'>
      {/* Inner container with min-width to prevent content from wrapping */}
      <div className='min-w-max px-4 py-2'>
        <div className='flex items-center justify-between gap-4'>
          {/* Left: Scenarios */}
          <div className='flex flex-shrink-0 items-center gap-2'>
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              Scenario:
            </span>
            <div className='flex gap-1'>
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario)}
                  title={scenario.fullLabel}
                  className={clsx(
                    'whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium transition-all',
                    selectedScenario.id === scenario.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  )}
                >
                  {scenario.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job Mode Toggle (FCFS vs Multiple) */}
          {setMultipleApplicants && (
            <div className='flex flex-shrink-0 items-center gap-2'>
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                Mode:
              </span>
              <div className='flex gap-1'>
                {jobModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setMultipleApplicants(mode.value)}
                    className={clsx(
                      'whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium transition-all',
                      multipleApplicants === mode.value
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Center: View Role */}
          <div className='flex flex-shrink-0 items-center gap-2'>
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              View:
            </span>
            <div className='flex gap-1'>
              {(['creator', 'worker', 'arbitrator'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRole(role)}
                  className={clsx(
                    'whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium capitalize transition-all',
                    userRole === role
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Status State Dropdown */}
          {setSelectedStatus && (
            <div className='flex flex-shrink-0 items-center gap-2'>
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                Status:
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className='rounded border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 transition-all hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500'
              >
                {statusStates.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Right: Status badges */}
          <div className='flex flex-shrink-0 items-center gap-2'>
            <span className='whitespace-nowrap rounded bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'>
              TEST MODE
            </span>
            {!multipleApplicants && (
              <span className='whitespace-nowrap rounded bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-0.5 text-xs font-bold text-white'>
                ⚡ FCFS
              </span>
            )}
            <span className='whitespace-nowrap rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
              {JobState[currentJob.state]}
            </span>
            {currentJob.disputed && (
              <span className='whitespace-nowrap rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400'>
                Disputed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Optional: Scroll indicator for mobile */}
    <div className='pointer-events-none absolute bottom-0 right-2 flex h-full items-center md:hidden'>
      <div className='h-full w-8 bg-gradient-to-l from-white/95 to-transparent dark:from-gray-900/95 dark:to-transparent' />
    </div>
  </div>
);

export const renderStatusComponent = (
  selectedStatus: string,
  currentJob: any,
  currentAddress: string | undefined,
  currentUsers: Record<string, User> | undefined,
  currentUser: User | undefined,
  selectedWorker: string,
  currentEvents: JobEventWithDiffs[] | undefined,
  currentSessionKeys: Record<string, string> | undefined,
  currentAddresses: string[] | undefined
) => {
  if (!currentJob) return null;

  const mockDeliveryEvents =
    currentEvents?.filter((e) => e.type_ === JobEventType.Delivered) || [];
  const mockCompletedEvents =
    currentEvents?.filter(
      (e) =>
        e.type_ === JobEventType.Delivered || e.type_ === JobEventType.Rated
    ) || [];
  const mockArbitrationEvents =
    currentEvents?.filter((e) => e.type_ === JobEventType.Arbitrated) || [];

  switch (selectedStatus) {
    case 'fcfs':
      return (
        <FCFSAvailable
          job={currentJob}
          address={currentAddress}
          users={currentUsers || {}}
          currentUser={currentUser}
        />
      );
    case 'assign':
      return (
        <AssignWorker
          job={currentJob}
          address={currentAddress}
          selectedWorker={selectedWorker || Object.keys(currentUsers || {})[1]}
          users={currentUsers || {}}
          currentUser={currentUser}
        />
      );
    case 'accepted':
      return (
        <WorkerAccepted
          job={currentJob}
          address={currentAddress}
          users={currentUsers || {}}
          selectedWorker={selectedWorker}
          currentUser={currentUser}
        />
      );
    case 'verification':
      return (
        <ResultVerification
          job={currentJob}
          users={currentUsers || {}}
          selectedWorker={selectedWorker}
          events={mockDeliveryEvents}
          address={currentAddress}
          sessionKeys={currentSessionKeys || {}}
          addresses={currentAddresses || []}
          currentUser={currentUser}
        />
      );
    case 'completed':
      return (
        <ResultAccepted
          job={currentJob}
          events={mockCompletedEvents}
          users={currentUsers || {}}
          selectedWorker={selectedWorker}
          currentUser={currentUser}
        />
      );
    case 'disputed':
      return (
        <DisputeStarted
          job={currentJob}
          address={currentAddress}
          users={currentUsers || {}}
          selectedWorker={selectedWorker}
          currentUser={currentUser}
        />
      );
    case 'arbitrated':
      return (
        <ArbitratedStatus
          job={currentJob}
          events={mockArbitrationEvents}
          users={currentUsers || {}}
          selectedWorker={selectedWorker}
          address={currentAddress}
          currentUser={currentUser}
        />
      );
    default:
      return null;
  }
};
