import { JobState } from '@effectiveacceleration/contracts';

// Mock job data generator
export const generateMockJob = (index: number, overrides?: any) => ({
  id: `job-${index}`,
  title: `Test Job ${index}`,
  description: `This is a test job description for job number ${index}. It contains detailed information about the requirements and expectations.`,
  tags: [`tag${index % 3}`, `category${index % 2}`],
  token:
    index % 2 === 0
      ? '0x1234567890123456789012345678901234567890'
      : '0x0987654321098765432109876543210987654321',
  amount: (index + 1) * 100,
  maxTime: 86400 * (index + 1), // Days in seconds
  state: JobState.Open,
  multipleApplicants: index % 2 === 0,
  jobTimes: {
    openedAt: Date.now() / 1000 - index * 3600, // Stagger by hours
    closedAt: null,
    completedAt: null,
  },
  roles: {
    creator: `0xCreator${index.toString().padStart(38, '0')}`,
    worker:
      index % 3 === 0 ? `0xWorker${index.toString().padStart(39, '0')}` : null,
    arbitrator: `0xArbitrator${index.toString().padStart(35, '0')}`,
  },
  applications: index % 2 === 0 ? index * 2 : 0,
  deliveryMethod: 'standard',
  collateralOwed: 0,
  escrowId: `escrow-${index}`,
  resultHash: null,
  createdAt: Date.now() / 1000 - index * 7200,
  updatedAt: Date.now() / 1000 - index * 3600,
  ...overrides,
});

// Generate array of mock jobs
export const generateMockJobs = (
  count: number = 15,
  startIndex: number = 0
) => {
  return Array.from({ length: count }, (_, i) =>
    generateMockJob(startIndex + i)
  );
};

// Generate mock new jobs (simulating jobs created after the last refresh)
export const generateMockNewJobs = (count: number = 3) => {
  return Array.from({ length: count }, (_, i) =>
    generateMockJob(1000 + i, {
      title: `New Job ${i + 1}`,
      jobTimes: {
        openedAt: Date.now() / 1000 + i * 60, // Future timestamps to simulate "new"
        closedAt: null,
        completedAt: null,
      },
      createdAt: Date.now() / 1000 + i * 60,
      updatedAt: Date.now() / 1000 + i * 60,
    })
  );
};

// Mock arbitrators data
export const generateMockArbitrators = () => [
  {
    id: '0xArbitrator1234567890123456789012345678',
    address: '0xArbitrator1234567890123456789012345678',
    name: 'Test Arbitrator 1',
    bio: 'Experienced arbitrator with 100+ resolved disputes',
    profilePicture: 'https://via.placeholder.com/150',
    reputation: 95,
    disputesResolved: 105,
    createdAt: Date.now() / 1000 - 86400 * 30,
  },
  {
    id: '0xArbitrator2345678901234567890123456789',
    address: '0xArbitrator2345678901234567890123456789',
    name: 'Test Arbitrator 2',
    bio: 'Fair and efficient dispute resolution',
    profilePicture: 'https://via.placeholder.com/150',
    reputation: 88,
    disputesResolved: 42,
    createdAt: Date.now() / 1000 - 86400 * 60,
  },
  {
    id: '0xArbitrator3456789012345678901234567890',
    address: '0xArbitrator3456789012345678901234567890',
    name: 'Test Arbitrator 3',
    bio: 'Specialized in technical disputes',
    profilePicture: 'https://via.placeholder.com/150',
    reputation: 92,
    disputesResolved: 78,
    createdAt: Date.now() / 1000 - 86400 * 90,
  },
];

// Check if test mode is enabled
export const isTestMode = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('test') === '1';
};

// Hook to get mock or real data based on test mode
export const useTestableJobSearch = (realHook: any, config: any) => {
  const realData = realHook(config);

  if (!isTestMode()) {
    return realData;
  }

  // Return mock data structure matching the real hook
  return {
    ...realData,
    data: config.minTimestamp ? generateMockNewJobs() : generateMockJobs(),
    isLoading: false,
    error: null,
  };
};

// Hook to get mock or real arbitrators based on test mode
export const useTestableArbitrators = (realHook: any) => {
  const realData = realHook();

  if (!isTestMode()) {
    return realData;
  }

  return {
    ...realData,
    data: generateMockArbitrators(),
    isLoading: false,
    error: null,
  };
};
