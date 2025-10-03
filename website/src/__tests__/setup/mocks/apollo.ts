import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { GET_JOB, GET_JOBS, GET_USER, GET_USERS } from '@/hooks/subsquid/queries';

// Mock job data
export const mockJob = {
  id: '1',
  address: '0x123',
  chainId: '1',
  title: 'Test Job',
  content: 'Test job description',
  tags: ['digital-audio', 'video'],
  token: '0xUSDC',
  amount: '1000000000',
  maxTime: '86400',
  deliveryMethod: 'ipfs',
  roles: {
    creator: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    worker: null,
    arbitrator: '0xArbitrator',
  },
  state: 'Open',
  createdAt: '1234567890',
  timestamp: '1234567890',
  events: [],
};

// Mock user data
export const mockUser = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  name: 'Test User',
  bio: 'Test bio',
  avatar: 'https://example.com/avatar.png',
  publicKey: '0xPublicKey',
  timestamp: '1234567890',
};

// Mock arbitrator data
export const mockArbitrator = {
  address: '0xArbitrator',
  name: 'Test Arbitrator',
  bio: 'Test arbitrator bio',
  fee: '100',
  settledCount: '10',
  refusedCount: '2',
};

export const mockJobQueryResponse: MockedResponse = {
  request: {
    query: GET_JOB,
    variables: { id: '1' },
  },
  result: {
    data: {
      job: mockJob,
    },
  },
};

export const mockJobsQueryResponse: MockedResponse = {
  request: {
    query: GET_JOBS,
    variables: { first: 10, skip: 0 },
  },
  result: {
    data: {
      jobs: [mockJob],
    },
  },
};

export const mockUserQueryResponse: MockedResponse = {
  request: {
    query: GET_USER,
    variables: { address: mockUser.address },
  },
  result: {
    data: {
      user: mockUser,
    },
  },
};

export const mockUsersQueryResponse: MockedResponse = {
  request: {
    query: GET_USERS,
    variables: { first: 10, skip: 0 },
  },
  result: {
    data: {
      users: [mockUser],
    },
  },
};
