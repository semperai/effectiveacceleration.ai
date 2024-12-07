import { JobEvent, JobEventType } from '@effectiveacceleration/contracts';
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';
import JSON5 from '@mainnet-pat/json5-bigint';
import '@mainnet-pat/json5-bigint/lib/presets/extended';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  disableDevLogs: true,
});

// Register event listener for the 'push' event.
self.addEventListener('push', function (event) {
  const payload = event.data ? event.data.text() : 'no payload';

  const jobEvent = JSON5.parse(payload) as Omit<
    JobEvent,
    'data_' | 'details'
  > & { jobId: string };

  let body = '';
  switch (jobEvent.type_) {
    case JobEventType.Created:
      // to arbitrator
      body = `Job #${jobEvent.jobId} created with you assigned as the arbitrator.`;
      break;
    case JobEventType.Taken:
      // to creator
      body = `Job #${jobEvent.jobId} has been taken.`;
      break;
    case JobEventType.Paid:
      // to worker
      body = `Job #${jobEvent.jobId} has been paid.`;
      break;
    case JobEventType.Updated:
      // to worker, old arbitrator and new arbitrator
      body = `Job #${jobEvent.jobId} has been updated.`;
      break;
    case JobEventType.Signed:
      // to creator
      body = `Job #${jobEvent.jobId} has been signed.`;
      break;
    case JobEventType.Completed:
      // to worker and arbitrator
      body = `Job #${jobEvent.jobId} has been approved.`;
      break;
    case JobEventType.Delivered:
      // to creator
      body = `Job #${jobEvent.jobId} has been delivered.`;
      break;
    case JobEventType.Rated:
      // to worker
      body = `Job #${jobEvent.jobId} has been rated.`;
      break;
    case JobEventType.Refunded:
      // to creator
      body = `Job #${jobEvent.jobId} has been refunded.`;
      break;
    case JobEventType.Disputed:
      // to creator/worker and arbitrator
      body = `Job #${jobEvent.jobId} has been disputed.`;
      break;
    case JobEventType.Arbitrated:
      // to creator and worker
      body = `Job #${jobEvent.jobId} has been arbitrated.`;
      break;
    case JobEventType.ArbitrationRefused:
      // to creator and worker
      body = `Job #${jobEvent.jobId} arbitration has been refused.`;
      break;
    case JobEventType.WhitelistedWorkerAdded:
      // to worker
      body = `You have been added to the whitelist of job #${jobEvent.jobId}.`;
      break;
    case JobEventType.WhitelistedWorkerRemoved:
      // to worker
      body = `You have been removed from the whitelist of job #${jobEvent.jobId}.`;
      break;
    case JobEventType.OwnerMessage:
    case JobEventType.WorkerMessage:
      // to creator/worker
      body = `New message in job #${jobEvent.jobId}.`;
      break;
  }

  // Keep the service worker alive until the notification is created.
  event.waitUntil(
    self.registration.showNotification('Effective Acceleration', {
      body: body,
      data: jobEvent,
      icon: '/favicon.svg',
      requireInteraction: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = `${self.location.origin}/dashboard/jobs/${event.notification.data.jobId}`;

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(async (clientsArr) => {
      // If a Window tab matching the targeted URL already exists, focus that;
      const windowClientToFocus = clientsArr.find(
        (windowClient) => windowClient.url === url
      );
      if (windowClientToFocus) {
        windowClientToFocus.focus();
        return;
      } else {
        // Otherwise, open a new tab to the applicable URL and focus it.
        const windowClient = await self.clients.openWindow(url);
        if (windowClient) {
          windowClient.focus();
          return;
        }
      }

      // safari fix
      const windowClient = clientsArr.find((c) => c.focused) ?? clientsArr[0];
      windowClient?.navigate(url);
      windowClient.focus();
    })
  );
});

serwist.addEventListeners();
