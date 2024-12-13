import { JobEvent, JobEventType } from '@effectiveacceleration/contracts';
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';
import JSON5 from '@mainnet-pat/json5-bigint';
import '@mainnet-pat/json5-bigint/lib/presets/extended';
import { EventTextMap } from './lib/utils';

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

type BroadcastMessage = { text: string; href?: string };
type JobEventMessage = Omit<JobEvent, 'data_' | 'details'>;

// Register event listener for the 'push' event.
self.addEventListener('push', function (event) {
  let body = '';
  let data: JobEventMessage | BroadcastMessage | undefined;

  const payload = event.data?.text();

  try {
    data = JSON5.parse(payload!);
  } catch {}

  if (!data) {
    return;
  }

  // if we have a 'text' member then it is a broadcast announcement notification
  if ('text' in data) {
    body = data.text;
  } else {
    // otherwise it is a job event notification
    const jobEvent = data;
    body = EventTextMap(jobEvent.type_, jobEvent.jobId)

    data = jobEvent;
  }

  // Keep the service worker alive until the notification is created.
  event.waitUntil(
    self.registration.showNotification('Effective Acceleration', {
      body: body,
      data: data,
      icon: '/favicon.svg',
      requireInteraction: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let href = event.notification.data?.href;
  if (href) {
    const internal = href.includes(self.location.origin);
    if (!internal) {
      href = `${self.location.origin}/redirect?url=${event.notification.data?.href}`;
    }
  }

  const url = event.notification.data?.jobId
    ? `${self.location.origin}/dashboard/jobs/${event.notification.data.jobId}?eventId=${event.notification.data.id}`
    : href
      ? href
      : `${self.location.origin}/dashboard`;

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
