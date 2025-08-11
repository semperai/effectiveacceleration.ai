import * as Sentry from '@sentry/nextjs';
import { JobEventType } from '@effectiveacceleration/contracts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}
export const EventTextMap = (
  eventType: JobEventType,
  jobId: string | bigint
) => {
  let body = '';
  switch (eventType) {
    case JobEventType.Created:
      // to arbitrator
      body = `Job #${jobId} created with you assigned as the arbitrator.`;
      break;
    case JobEventType.Taken:
      // to creator
      body = `Job #${jobId} has been taken.`;
      break;
    case JobEventType.Paid:
      // to worker
      body = `Job #${jobId} has been paid.`;
      break;
    case JobEventType.Updated:
      // to worker, old arbitrator and new arbitrator
      body = `Job #${jobId} has been updated.`;
      break;
    case JobEventType.Signed:
      // to creator
      body = `Job #${jobId} has been signed.`;
      break;
    case JobEventType.Completed:
      // to worker and arbitrator
      body = `Job #${jobId} has been approved.`;
      break;
    case JobEventType.Delivered:
      // to creator
      body = `Job #${jobId} has been delivered.`;
      break;
    case JobEventType.Rated:
      // to worker
      body = `Job #${jobId} has been rated.`;
      break;
    case JobEventType.Refunded:
      // to creator
      body = `Job #${jobId} has been refunded.`;
      break;
    case JobEventType.Disputed:
      // to creator/worker and arbitrator
      body = `Job #${jobId} has been disputed.`;
      break;
    case JobEventType.Arbitrated:
      // to creator and worker
      body = `Job #${jobId} has been arbitrated.`;
      break;
    case JobEventType.ArbitrationRefused:
      // to creator and worker
      body = `Job #${jobId} arbitration has been refused.`;
      break;
    case JobEventType.WhitelistedWorkerAdded:
      // to worker
      body = `You have been added to the whitelist of job #${jobId}.`;
      break;
    case JobEventType.WhitelistedWorkerRemoved:
      // to worker
      body = `You have been removed from the whitelist of job #${jobId}.`;
      break;
    case JobEventType.OwnerMessage:
    case JobEventType.WorkerMessage:
      // to creator/worker
      body = `New message in job #${jobId}.`;
      break;
  }
  return body;
};

export async function isImageValid(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok; // Return true if the response is ok (status in the range 200-299)
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error checking image URL:', error);
    // TODO show toast here
    return false;
  }
}

export function shortenText({
  text,
  maxLength,
}: {
  text: string | string | undefined;
  maxLength: number;
}): string {
  if (!text) {
    console.error('No text provided');
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }

  const partLength = Math.floor((maxLength - 3) / 2); // Subtract 3 for the ellipsis
  const start = text.slice(0, partLength + 1);
  const end = text.slice(-partLength + 1);

  return `${start}...${end}`;
}

export const convertToSeconds = (deadline: number, unit: string): number => {
  switch (unit) {
    case 'minutes':
      return deadline * 60;
    case 'hours':
      return deadline * 60 * 60;
    case 'days':
      return deadline * 60 * 60 * 24;
    case 'weeks':
      return deadline * 60 * 60 * 24 * 7;
    case 'months':
      return deadline * 60 * 60 * 24 * 30; // Approximation
    case 'years':
      return deadline * 60 * 60 * 24 * 365; // Approximation
    default:
      return 0;
  }
};

export const getUnitAndValueFromSeconds = (
  seconds: number
): {
  unit: string;
  value: number;
} => {
  const years = seconds / (60 * 60 * 24 * 7 * 4 * 12);
  const months = seconds / (60 * 60 * 24 * 7 * 4);
  const weeks = seconds / (60 * 60 * 24 * 7);
  const days = seconds / (60 * 60 * 24);
  const hours = seconds / (60 * 60);
  const minutes = seconds / 60;

  if (years % 1 === 0) {
    return { unit: 'years', value: years };
  } else if (months % 1 === 0) {
    return { unit: 'months', value: months };
  } else if (weeks % 1 === 0) {
    return { unit: 'weeks', value: weeks };
  } else if (days % 1 === 0) {
    return { unit: 'days', value: days };
  } else if (hours % 1 === 0) {
    return { unit: 'hours', value: hours };
  } else {
    return { unit: 'minutes', value: minutes };
  }
};

export const unitsDeliveryTime = [
  { id: '0', name: 'minutes' },
  { id: '1', name: 'hours' },
  { id: '2', name: 'days' },
  { id: '3', name: 'weeks' },
  { id: '4', name: 'months' },
  { id: '5', name: 'years' },
];

export const formatTimeLeft = (maxTime: number) => {
  const pluralize = (value: number, unit: string) =>
    `${value} ${unit}${value === 1 ? '' : 's'}`;

  if (maxTime < 60) return pluralize(maxTime, 'second');
  if (maxTime < 3600) return pluralize(Math.floor(maxTime / 60), 'minute');
  if (maxTime < 86400) return pluralize(Math.floor(maxTime / 3600), 'hour');
  if (maxTime < 604800) return pluralize(Math.floor(maxTime / 86400), 'day');
  return pluralize(Math.floor(maxTime / 604800), 'week');
};

export const formatMarkdownContent = (
  result: string,
  setMarkdownContent: (content: string) => void
) => {
  if (result?.startsWith('#filename%3D')) {
    try {
      const hash = result.slice(1);
      const params = new URLSearchParams(decodeURIComponent(hash));
      const filename = params.get('filename');

      if (filename) {
        setMarkdownContent(
          `Click to download results: **[${filename}](${result})**`
        );
      } else {
        console.error('Filename parameter is missing in the result string.');
      }
    } catch (error) {
      console.error('Error parsing the result string:', error);
    }
  } else {
    setMarkdownContent(result);
  }
};
