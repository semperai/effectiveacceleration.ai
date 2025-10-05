import { JobEventType } from '@effectiveacceleration/contracts';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  cn,
  formatDate,
  absoluteUrl,
  EventTextMap,
  isImageValid,
  shortenText,
  convertToSeconds,
  getUnitAndValueFromSeconds,
  formatTimeLeft,
} from '../../src/lib/utils';

describe('cn (className merge)', () => {
  it('should merge class names correctly', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
  });

  it('should handle conditional classes', () => {
    expect(cn('btn', false && 'hidden', 'active')).toBe('btn active');
  });

  it('should merge tailwind classes without conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});

describe('formatDate', () => {
  it('should format string date correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBe('January 15, 2024');
  });

  it('should format timestamp correctly', () => {
    const timestamp = new Date('2024-03-20').getTime();
    const result = formatDate(timestamp);
    expect(result).toBe('March 20, 2024');
  });

  it('should format numeric timestamp correctly', () => {
    const result = formatDate(1234567890000);
    expect(result).toContain('2009');
  });
});

describe('absoluteUrl', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  it('should create absolute URL from path', () => {
    expect(absoluteUrl('/jobs/1')).toBe('https://example.com/jobs/1');
  });

  it('should handle root path', () => {
    expect(absoluteUrl('/')).toBe('https://example.com/');
  });

  it('should handle paths without leading slash', () => {
    expect(absoluteUrl('about')).toBe('https://example.comabout');
  });
});

describe('EventTextMap', () => {
  it('should return correct text for Created event', () => {
    expect(EventTextMap(JobEventType.Created, '123')).toBe(
      'Job #123 created with you assigned as the arbitrator.'
    );
  });

  it('should return correct text for Taken event', () => {
    expect(EventTextMap(JobEventType.Taken, '456')).toBe(
      'Job #456 has been taken.'
    );
  });

  it('should return correct text for Paid event', () => {
    expect(EventTextMap(JobEventType.Paid, '789')).toBe(
      'Job #789 has been paid.'
    );
  });

  it('should return correct text for Updated event', () => {
    expect(EventTextMap(JobEventType.Updated, '100')).toBe(
      'Job #100 has been updated.'
    );
  });

  it('should return correct text for Completed event', () => {
    expect(EventTextMap(JobEventType.Completed, '200')).toBe(
      'Job #200 has been approved.'
    );
  });

  it('should return correct text for Delivered event', () => {
    expect(EventTextMap(JobEventType.Delivered, '300')).toBe(
      'Job #300 has been delivered.'
    );
  });

  it('should return correct text for Disputed event', () => {
    expect(EventTextMap(JobEventType.Disputed, '400')).toBe(
      'Job #400 has been disputed.'
    );
  });

  it('should return correct text for Arbitrated event', () => {
    expect(EventTextMap(JobEventType.Arbitrated, '500')).toBe(
      'Job #500 has been arbitrated.'
    );
  });

  it('should return correct text for WhitelistedWorkerAdded event', () => {
    expect(EventTextMap(JobEventType.WhitelistedWorkerAdded, '600')).toBe(
      'You have been added to the whitelist of job #600.'
    );
  });

  it('should return correct text for WhitelistedWorkerRemoved event', () => {
    expect(EventTextMap(JobEventType.WhitelistedWorkerRemoved, '700')).toBe(
      'You have been removed from the whitelist of job #700.'
    );
  });

  it('should return correct text for OwnerMessage event', () => {
    expect(EventTextMap(JobEventType.OwnerMessage, '800')).toBe(
      'New message in job #800.'
    );
  });

  it('should return correct text for WorkerMessage event', () => {
    expect(EventTextMap(JobEventType.WorkerMessage, '900')).toBe(
      'New message in job #900.'
    );
  });

  it('should handle bigint job IDs', () => {
    expect(EventTextMap(JobEventType.Created, BigInt(999))).toBe(
      'Job #999 created with you assigned as the arbitrator.'
    );
  });
});

describe('isImageValid', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true for valid image URL', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });
    const result = await isImageValid('https://example.com/image.jpg');
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/image.jpg',
      { method: 'HEAD' }
    );
  });

  it('should return false for invalid image URL', async () => {
    (global.fetch as any).mockResolvedValue({ ok: false });
    const result = await isImageValid('https://example.com/notfound.jpg');
    expect(result).toBe(false);
  });

  it('should return false on fetch error', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation();
    const result = await isImageValid('https://example.com/error.jpg');
    expect(result).toBe(false);
    consoleSpy.mockRestore();
  });
});

describe('shortenText', () => {
  it('should return text as-is if shorter than maxLength', () => {
    expect(shortenText({ text: 'Hello', maxLength: 10 })).toBe('Hello');
  });

  it('should shorten long text correctly', () => {
    const text = '0x1234567890abcdef1234567890abcdef';
    const result = shortenText({ text, maxLength: 15 });
    expect(result).toBe('0x12345...bcdef');
    expect(result.length).toBe(15);
  });

  it('should handle even maxLength correctly', () => {
    const text = 'abcdefghijklmnop';
    const result = shortenText({ text, maxLength: 10 });
    expect(result).toBe('abcd...op');
  });

  it('should handle undefined text', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation();
    expect(shortenText({ text: undefined, maxLength: 10 })).toBe('');
    expect(consoleSpy).toHaveBeenCalledWith('No text provided');
    consoleSpy.mockRestore();
  });

  it('should handle empty string', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation();
    expect(shortenText({ text: '', maxLength: 10 })).toBe('');
    consoleSpy.mockRestore();
  });
});

describe('convertToSeconds', () => {
  it('should convert minutes to seconds', () => {
    expect(convertToSeconds(5, 'minutes')).toBe(300);
  });

  it('should convert hours to seconds', () => {
    expect(convertToSeconds(2, 'hours')).toBe(7200);
  });

  it('should convert days to seconds', () => {
    expect(convertToSeconds(1, 'days')).toBe(86400);
  });

  it('should convert weeks to seconds', () => {
    expect(convertToSeconds(1, 'weeks')).toBe(604800);
  });

  it('should convert months to seconds (30 day approximation)', () => {
    expect(convertToSeconds(1, 'months')).toBe(2592000);
  });

  it('should convert years to seconds (365 day approximation)', () => {
    expect(convertToSeconds(1, 'years')).toBe(31536000);
  });

  it('should return 0 for unknown unit', () => {
    expect(convertToSeconds(5, 'unknown')).toBe(0);
  });

  it('should handle decimal values', () => {
    expect(convertToSeconds(1.5, 'hours')).toBe(5400);
  });
});

describe('getUnitAndValueFromSeconds', () => {
  it('should return minutes for small values', () => {
    expect(getUnitAndValueFromSeconds(300)).toEqual({
      unit: 'minutes',
      value: 5,
    });
  });

  it('should return hours for hour-aligned values', () => {
    expect(getUnitAndValueFromSeconds(7200)).toEqual({
      unit: 'hours',
      value: 2,
    });
  });

  it('should return days for day-aligned values', () => {
    expect(getUnitAndValueFromSeconds(86400)).toEqual({
      unit: 'days',
      value: 1,
    });
  });

  it('should return weeks for week-aligned values', () => {
    expect(getUnitAndValueFromSeconds(604800)).toEqual({
      unit: 'weeks',
      value: 1,
    });
  });

  it('should return months for month-aligned values', () => {
    expect(getUnitAndValueFromSeconds(2419200)).toEqual({
      unit: 'months',
      value: 1,
    });
  });

  it('should return years for year-aligned values', () => {
    expect(getUnitAndValueFromSeconds(29030400)).toEqual({
      unit: 'years',
      value: 1,
    });
  });

  it('should default to minutes for non-aligned values', () => {
    expect(getUnitAndValueFromSeconds(150)).toEqual({
      unit: 'minutes',
      value: 2.5,
    });
  });
});

describe('formatTimeLeft', () => {
  it('should format seconds', () => {
    expect(formatTimeLeft(30)).toBe('30 seconds');
    expect(formatTimeLeft(1)).toBe('1 second');
  });

  it('should format minutes', () => {
    expect(formatTimeLeft(120)).toBe('2 minutes');
    expect(formatTimeLeft(60)).toBe('1 minute');
  });

  it('should format hours', () => {
    expect(formatTimeLeft(7200)).toBe('2 hours');
    expect(formatTimeLeft(3600)).toBe('1 hour');
  });

  it('should format days', () => {
    expect(formatTimeLeft(172800)).toBe('2 days');
    expect(formatTimeLeft(86400)).toBe('1 day');
  });

  it('should format weeks', () => {
    expect(formatTimeLeft(1209600)).toBe('2 weeks');
    expect(formatTimeLeft(604800)).toBe('1 week');
  });

  it('should handle edge cases', () => {
    expect(formatTimeLeft(59)).toBe('59 seconds');
    expect(formatTimeLeft(3599)).toBe('59 minutes');
    expect(formatTimeLeft(86399)).toBe('23 hours');
  });
});
