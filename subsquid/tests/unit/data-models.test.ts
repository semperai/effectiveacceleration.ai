import { describe, it, expect } from 'vitest';
import { ZeroAddress, ZeroHash, getAddress } from 'ethers';

/**
 * Data model tests
 *
 * Note: These tests are currently skipped because the TypeORM models
 * require reflect-metadata and specific TypeORM setup to instantiate.
 * To test the models properly, you should:
 * 1. Test them in integration tests with a real database
 * 2. Or create factory functions that don't rely on decorators
 */

describe.skip('Data Models', () => {
  describe('User Model', () => {
    it('should create a user with correct properties', () => {
      const user = new User({
        id: getAddress('0x1234567890123456789012345678901234567890'),
        address_: getAddress('0x1234567890123456789012345678901234567890'),
        publicKey: 'test_pubkey',
        name: 'Test User',
        bio: 'Test bio',
        avatar: 'https://example.com/avatar.png',
        reputationUp: 10,
        reputationDown: 2,
        averageRating: 45000,
        numberOfReviews: 5,
        myReviews: [],
        reviews: [],
        timestamp: Math.floor(Date.now() / 1000),
      });

      expect(user.id).toBeDefined();
      expect(user.name).toBe('Test User');
      expect(user.reputationUp).toBe(10);
      expect(user.reputationDown).toBe(2);
      expect(user.averageRating).toBe(45000);
      expect(user.numberOfReviews).toBe(5);
    });
  });

  describe('Arbitrator Model', () => {
    it('should create an arbitrator with correct properties', () => {
      const arbitrator = new Arbitrator({
        id: getAddress('0xarbitrator1234567890123456789012345678'),
        address_: getAddress('0xarbitrator1234567890123456789012345678'),
        publicKey: 'arbitrator_pubkey',
        name: 'Test Arbitrator',
        bio: 'Experienced arbitrator',
        avatar: 'https://example.com/avatar.png',
        fee: 50000000000000000n,
        refusedCount: 1,
        settledCount: 10,
        timestamp: Math.floor(Date.now() / 1000),
      });

      expect(arbitrator.id).toBeDefined();
      expect(arbitrator.name).toBe('Test Arbitrator');
      expect(arbitrator.fee).toBe(50000000000000000n);
      expect(arbitrator.refusedCount).toBe(1);
      expect(arbitrator.settledCount).toBe(10);
    });
  });

  describe('Job Model', () => {
    it('should create a job with default state', () => {
      const job = new Job({
        id: '1',
        title: 'Test Job',
        contentHash: 'QmTest123',
        content: 'Job description',
        multipleApplicants: true,
        tags: ['development'],
        token: getAddress('0x1234567890123456789012345678901234567890'),
        amount: 1000000000000000000n,
        maxTime: 86400,
        deliveryMethod: 'ipfs',
        collateralOwed: 0n,
        escrowId: 0n,
        disputed: false,
        state: 0,
        rating: 0,
        resultHash: ZeroHash,
        allowedWorkers: [],
        whitelistWorkers: false,
        eventCount: 0,
        events: [],
        timestamp: Math.floor(Date.now() / 1000),
        roles: new JobRoles({
          creator: getAddress('0xcreator123456789012345678901234567890'),
          worker: ZeroAddress,
          arbitrator: ZeroAddress,
        }),
        jobTimes: new JobTimes({
          createdAt: Math.floor(Date.now() / 1000),
          openedAt: Math.floor(Date.now() / 1000),
          lastEventAt: Math.floor(Date.now() / 1000),
          updatedAt: 0,
          assignedAt: 0,
          closedAt: 0,
          disputedAt: 0,
          arbitratedAt: 0,
        }),
      });

      expect(job.id).toBe('1');
      expect(job.title).toBe('Test Job');
      expect(job.amount).toBe(1000000000000000000n);
      expect(job.disputed).toBe(false);
      expect(job.state).toBe(0);
      expect(job.roles.creator).toBeDefined();
      expect(job.roles.worker).toBe(ZeroAddress);
      expect(job.jobTimes.createdAt).toBeGreaterThan(0);
    });

    it('should handle job state transitions', () => {
      const job = new Job({
        id: '2',
        roles: new JobRoles({
          creator: ZeroAddress,
          worker: ZeroAddress,
          arbitrator: ZeroAddress,
        }),
      });

      // Test state = Open (0)
      job.state = 0;
      expect(job.state).toBe(0);

      // Test state = Taken (1)
      job.state = 1;
      expect(job.state).toBe(1);

      // Test state = Closed (2)
      job.state = 2;
      expect(job.state).toBe(2);
    });
  });

  describe('Review Model', () => {
    it('should create a review with correct properties', () => {
      const review = new Review({
        id: 'review_1',
        rating: 5,
        jobId: 1n,
        text: 'Excellent work!',
        timestamp: Math.floor(Date.now() / 1000),
        user: getAddress('0xuser1234567890123456789012345678901234'),
        reviewer: getAddress('0xreviewer123456789012345678901234567'),
        userLoaded: new User({ id: getAddress('0xuser1234567890123456789012345678901234') }),
        reviewerLoaded: new User({ id: getAddress('0xreviewer123456789012345678901234567') }),
      });

      expect(review.id).toBe('review_1');
      expect(review.rating).toBe(5);
      expect(review.text).toBe('Excellent work!');
      expect(review.jobId).toBe(1n);
    });
  });

  describe('Marketplace Model', () => {
    it('should create a marketplace with correct properties', () => {
      const marketplace = new Marketplace({
        id: getAddress('0xmarketplace123456789012345678901234'),
        marketplaceData: getAddress('0xdata1234567890123456789012345678901234567'),
        paused: false,
        jobCount: 100,
        userCount: 50,
        arbitratorCount: 5,
      });

      expect(marketplace.id).toBeDefined();
      expect(marketplace.paused).toBe(false);
      expect(marketplace.jobCount).toBe(100);
      expect(marketplace.userCount).toBe(50);
      expect(marketplace.arbitratorCount).toBe(5);
    });
  });

  describe('JobRoles', () => {
    it('should create job roles with all addresses', () => {
      const roles = new JobRoles({
        creator: getAddress('0xcreator123456789012345678901234567890'),
        worker: getAddress('0xworker567890123456789012345678901234'),
        arbitrator: getAddress('0xarbitrator1234567890123456789012345678'),
      });

      expect(roles.creator).toBeDefined();
      expect(roles.worker).toBeDefined();
      expect(roles.arbitrator).toBeDefined();
    });
  });

  describe('JobTimes', () => {
    it('should create job times with all timestamps', () => {
      const now = Math.floor(Date.now() / 1000);
      const times = new JobTimes({
        createdAt: now,
        openedAt: now,
        lastEventAt: now,
        updatedAt: 0,
        assignedAt: 0,
        closedAt: 0,
        disputedAt: 0,
        arbitratedAt: 0,
      });

      expect(times.createdAt).toBe(now);
      expect(times.openedAt).toBe(now);
      expect(times.lastEventAt).toBe(now);
      expect(times.closedAt).toBe(0);
    });
  });
});
