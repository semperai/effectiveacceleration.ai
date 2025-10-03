import { describe, it, expect } from 'vitest';
import {
  JobEventType,
  JobState,
} from '@effectiveacceleration/contracts';

describe('Job Event Types and States', () => {
  describe('JobEventType', () => {
    it('should have all expected event types defined', () => {
      expect(JobEventType.Created).toBeDefined();
      expect(JobEventType.Taken).toBeDefined();
      expect(JobEventType.Paid).toBeDefined();
      expect(JobEventType.Updated).toBeDefined();
      expect(JobEventType.Signed).toBeDefined();
      expect(JobEventType.Completed).toBeDefined();
      expect(JobEventType.Delivered).toBeDefined();
      expect(JobEventType.Closed).toBeDefined();
      expect(JobEventType.Reopened).toBeDefined();
      expect(JobEventType.Rated).toBeDefined();
      expect(JobEventType.Refunded).toBeDefined();
      expect(JobEventType.Disputed).toBeDefined();
      expect(JobEventType.Arbitrated).toBeDefined();
      expect(JobEventType.ArbitrationRefused).toBeDefined();
      expect(JobEventType.WhitelistedWorkerAdded).toBeDefined();
      expect(JobEventType.WhitelistedWorkerRemoved).toBeDefined();
      expect(JobEventType.CollateralWithdrawn).toBeDefined();
      expect(JobEventType.OwnerMessage).toBeDefined();
      expect(JobEventType.WorkerMessage).toBeDefined();
    });

    it('should have numeric values for event types', () => {
      expect(typeof JobEventType.Created).toBe('number');
      expect(typeof JobEventType.Taken).toBe('number');
      expect(typeof JobEventType.Paid).toBe('number');
    });
  });

  describe('JobState', () => {
    it('should have all expected states defined', () => {
      expect(JobState.Open).toBeDefined();
      expect(JobState.Taken).toBeDefined();
      expect(JobState.Closed).toBeDefined();
    });

    it('should have numeric values for states', () => {
      expect(typeof JobState.Open).toBe('number');
      expect(typeof JobState.Taken).toBe('number');
      expect(typeof JobState.Closed).toBe('number');
    });

    it('should have distinct values for each state', () => {
      const states = [JobState.Open, JobState.Taken, JobState.Closed];
      const uniqueStates = new Set(states);
      expect(uniqueStates.size).toBe(3);
    });
  });
});
