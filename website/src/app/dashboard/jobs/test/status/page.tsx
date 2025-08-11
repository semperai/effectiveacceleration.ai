'use client';

import { useState } from 'react';
import { Layout } from '@/components/Dashboard/Layout';
import clsx from 'clsx';

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
  type JobArbitratedEvent,
  type JobRatedEvent,
} from '@effectiveacceleration/contracts';
import { zeroAddress, zeroHash } from 'viem';

// Mock addresses
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
    'We need an experienced developer to create a comprehensive DeFi dashboard that tracks multiple protocols, displays real-time analytics, and provides portfolio management features.',
  contentHash:
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  tags: ['defi', 'react', 'web3', 'typescript'],
  token: '0x0000000000000000000000000000000000000000',
  amount: BigInt('1000000000000000000'),
  maxTime: 604800,
  deliveryMethod: 'IPFS',
  collateralOwed: BigInt('0'),
  escrowId: BigInt('1'),
  resultHash:
    state === JobState.Taken && !disputed
      ? '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12'
      : zeroHash,
  rating: 0,
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
    arbitratedAt: 0,
    updatedAt: Math.floor(Date.now() / 1000) - 3600,
    lastEventAt: Math.floor(Date.now() / 1000) - 1800,
  },
  whitelistWorkers: false,
  multipleApplicants: false,
  allowedWorkers: [],
  result: '',
});

const mockUsers: Record<string, User> = {
  [mockAddress]: createMockUser(mockAddress, 'Alice (Creator)'),
  [mockWorkerAddress]: createMockUser(mockWorkerAddress, 'Bob (Worker)'),
  [mockArbitratorAddress]: createMockUser(
    mockArbitratorAddress,
    'Charlie (Arbitrator)'
  ),
};

// Create mock events
const createMockEvent = (
  type: JobEventType,
  details?: any
): JobEventWithDiffs => ({
  id: Math.random().toString(),
  jobId: BigInt('1'),
  type_: type,
  address_: mockAddress,
  data_: '0x00',
  timestamp_: Math.floor(Date.now() / 1000),
  job: createMockJob(JobState.Open),
  details: details || {},
  diffs: [],
});

const mockDeliveryEvents = [
  createMockEvent(JobEventType.Delivered, {
    result: 'Dashboard complete! Live URL: https://defi-dashboard.vercel.app',
  }),
];

const mockCompletedEvents = [
  createMockEvent(JobEventType.Delivered, {
    result: 'Work completed successfully with all requirements met.',
  }),
  createMockEvent(JobEventType.Rated, {
    rating: 5,
    review: 'Excellent work! Exceeded expectations.',
  } as JobRatedEvent),
];

const mockArbitrationEvents = [
  createMockEvent(JobEventType.Arbitrated, {
    creatorAmount: BigInt('200000000000000000'),
    workerAmount: BigInt('800000000000000000'),
    reason:
      'After review, the worker delivered most requirements. Awarding 80% to worker.',
  } as JobArbitratedEvent),
];

// Status states configuration
const statusStates = [
  {
    id: 'assign',
    label: 'Assign Worker',
  },
  {
    id: 'accepted',
    label: 'Worker Accepted',
  },
  {
    id: 'verification',
    label: 'Result Verification',
  },
  {
    id: 'completed',
    label: 'Result Accepted',
  },
  {
    id: 'disputed',
    label: 'Dispute Started',
  },
  {
    id: 'arbitrated',
    label: 'Arbitration Complete',
  },
];

const roles = [
  { id: 'creator', label: 'Creator' },
  { id: 'worker', label: 'Worker' },
  { id: 'arbitrator', label: 'Arbitrator' },
];

export default function StatusStatesTestPage() {
  const [selectedStatus, setSelectedStatus] = useState(statusStates[0]);
  const [selectedRole, setSelectedRole] = useState(roles[0]);

  const getCurrentAddress = () => {
    switch (selectedRole.id) {
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

  // Render the selected status component
  const renderStatusComponent = () => {
    switch (selectedStatus.id) {
      case 'assign':
        return (
          <AssignWorker
            job={createMockJob(JobState.Open)}
            address={currentAddress}
            selectedWorker={mockWorkerAddress}
            users={mockUsers}
          />
        );
      case 'accepted':
        return (
          <WorkerAccepted
            job={createMockJob(JobState.Taken)}
            address={currentAddress}
            users={mockUsers}
          />
        );
      case 'verification':
        return (
          <ResultVerification
            job={{
              ...createMockJob(JobState.Taken),
              resultHash:
                '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12',
            }}
            users={mockUsers}
            selectedWorker={mockWorkerAddress}
            events={mockDeliveryEvents}
            address={currentAddress}
            sessionKeys={{}}
            addresses={Object.keys(mockUsers)}
          />
        );
      case 'completed':
        return (
          <ResultAccepted
            job={createMockJob(JobState.Closed)}
            events={mockCompletedEvents}
            users={mockUsers}
            selectedWorker={mockWorkerAddress}
          />
        );
      case 'disputed':
        return (
          <DisputeStarted
            job={{ ...createMockJob(JobState.Taken), disputed: true }}
            address={currentAddress}
            users={mockUsers}
          />
        );
      case 'arbitrated':
        return (
          <ArbitratedStatus
            job={createMockJob(JobState.Closed, true)}
            events={mockArbitrationEvents}
            users={mockUsers}
            selectedWorker={mockWorkerAddress}
            address={currentAddress}
          />
        );
      default:
        return null;
    }
  };

  // Get color classes for the selected status
  const getColorClasses = (color: string, isSelected: boolean) => {
    if (isSelected) {
      const colors: Record<string, string> = {
        blue: 'bg-blue-600 text-white',
        purple: 'bg-purple-600 text-white',
        amber: 'bg-amber-600 text-white',
        green: 'bg-green-600 text-white',
        red: 'bg-red-600 text-white',
        slate: 'bg-slate-600 text-white',
      };
      return colors[color] || 'bg-gray-600 text-white';
    }
    return 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600';
  };

  return (
    <Layout>
      <div className='space-y-6'>
        {/* Minimal Control Bar */}
        <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center gap-6'>
            {/* Status Selector */}
            <div className='flex items-center gap-2'>
              <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                Status:
              </span>
              <div className='flex gap-1'>
                {statusStates.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => setSelectedStatus(status)}

                    className={clsx(
                      'rounded-md px-3 py-1 text-xs font-medium transition-all',
                      getColorClasses(
                        status.color,
                        selectedStatus.id === status.id
                      ),
                      selectedStatus.id === status.id && 'shadow-sm'
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Selector */}
            <div className='flex items-center gap-2'>
              <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                View as:
              </span>
              <div className='flex gap-1'>
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={clsx(
                      'rounded-md px-3 py-1 text-xs font-medium transition-all',
                      selectedRole.id === role.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                    )}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          </div>


        </div>

        {/* Main Content Area */}
        <div className='rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
          {/* Component Preview */}
          <div className='mx-auto max-w-4xl'>{renderStatusComponent()}</div>
        </div>
      </div>
    </Layout>
  );
}
