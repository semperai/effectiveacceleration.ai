import { ZeroAddress, ZeroHash } from 'ethers';

export const mockJobCreatedEventData = {
  title: 'Test Job',
  contentHash: 'QmTest123',
  multipleApplicants: true,
  tags: ['development', 'testing'],
  token: '0x1234567890123456789012345678901234567890',
  amount: 1000000000000000000n,
  maxTime: 86400,
  deliveryMethod: 'ipfs',
  arbitrator: '0xarbitrator1234567890123456789012345678',
  whitelistWorkers: false,
};

export const mockJobUpdatedEventData = {
  title: 'Updated Test Job',
  contentHash: 'QmUpdated456',
  tags: ['development', 'testing', 'updated'],
  maxTime: 172800,
  arbitrator: '0xarbitrator1234567890123456789012345678',
  amount: 2000000000000000000n,
  whitelistWorkers: true,
};

export const mockJobSignedEventData = {
  workerAddress: '0xworker567890123456789012345678901234',
};

export const mockJobRatedEventData = {
  rating: 5,
  review: 'Excellent work!',
};

export const mockJobDisputedEventData = {
  reason: 'Work not delivered as specified',
};

export const mockJobArbitratedEventData = {
  workerAmount: 500000000000000000n,
  creatorAmount: 500000000000000000n,
  reason: 'Split decision - both parties partially responsible',
};

export const mockJobMessageEventData = {
  recipientAddress: '0xrecipient12345678901234567890123456',
  encryptedMessage: 'encrypted_message_content',
};

export const mockLog = {
  id: '0x1234567890abcdef',
  block: {
    timestamp: Math.floor(Date.now() / 1000),
  },
  topics: ['0xtopic'],
  address: '0xmarketplace123456789012345678901234',
};

export const mockUser = {
  addr: '0xuser1234567890123456789012345678901234',
  pubkey: 'pubkey_test_123',
  name: 'Test User',
  bio: 'Test bio',
  avatar: 'https://example.com/avatar.png',
};

export const mockArbitrator = {
  addr: '0xarbitrator1234567890123456789012345678',
  pubkey: 'arbitrator_pubkey_test',
  name: 'Test Arbitrator',
  bio: 'Experienced arbitrator',
  avatar: 'https://example.com/arbitrator.png',
  fee: 50000000000000000n,
};

export const mockJobEventBase = {
  address_: '0xevent_address1234567890123456789012',
  data_: '',
  timestamp_: Math.floor(Date.now() / 1000),
  type_: 0,
};
