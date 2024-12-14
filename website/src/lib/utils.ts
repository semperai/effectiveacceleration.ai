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
