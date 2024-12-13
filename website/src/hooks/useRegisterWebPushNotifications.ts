import { useEffect, useState } from 'react';
import { watchAccount } from '@wagmi/core';
import { config } from '@/app/providers';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

let requested = false;

export const subscribeToWebPushNotifications = async (
  address: string | undefined,
  prevAddress?: string
) => {
  const registration = (await navigator.serviceWorker.getRegistration())!;
  let subscription = await registration.pushManager.getSubscription();

  if (subscription && address !== prevAddress && address !== undefined) {
    console.log(
      'Unsubscribing from existing web push notifications subscription'
    );
    await subscription.unsubscribe();
    subscription = null;
  }

  console.log('Registering for web push notifications');
  let applicationServerKey;
  try {
    // Get the server's public key
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PUSH_SERVICE_URL}/vapidPublicKey`
    );
    const vapidPublicKey = await response.text();
    // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
    // urlBase64ToUint8Array() is defined in /tools.js
    applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
  } catch {
    console.error("Failed to contact notification server")
    return;
  }

  // check perfmissions
  if (
    (await registration.pushManager.permissionState({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    })) === 'denied'
  ) {
    return;
  }

  // If a subscription was found, return it.
  if (!subscription) {
    // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
    // send notifications that don't have a visible effect for the user).
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    });

    const json = subscription.toJSON();
    (json as any).address = address ?? '0x';

    try {
      // Send the subscription details to the server using the Fetch API.
      await fetch(`${process.env.NEXT_PUBLIC_PUSH_SERVICE_URL}/register`, {
        method: 'post',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          subscription: json,
        }),
      });
    } catch {
      await subscription.unsubscribe();
    }
  }
};

export const unsubscribeFromWebPushNotifications = async () => {
  const registration = (await navigator.serviceWorker.getRegistration())!;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  console.log('Unsubscribing from web push notifications');

  await subscription.unsubscribe();
};

export const useRegisterWebPushNotifications = () => {
  const [account, setAccount] = useState<string>();
  const [prevAccount, setPrevAccount] = useState<string>();

  useEffect(() => {
    const unwatch = watchAccount(config, {
      onChange(account, prevAccount) {
        if (account.address === prevAccount.address) {
          return;
        }
        console.log('Account changed to:', account);
        setAccount(account.address);
        setPrevAccount(prevAccount.address);
      },
    });

    return () => unwatch();
  }, []);

  useEffect(() => {
    const handler = async () => {
      // if (!account && !prevAccount) {
      //   return;
      // }

      if (requested) {
        return;
      }

      console.log('Requesting web push notifications');

      requested = true;

      await subscribeToWebPushNotifications(account, prevAccount);

      window.removeEventListener('mousedown', handler);
      requested = false;
      // window.removeEventListener("touchstart", handler);
      // window.removeEventListener("scroll", handler);
    };

    window.addEventListener('mousedown', handler);

    return () => {
      window.removeEventListener('mousedown', handler);
      requested = false;
    };
  }, [account, prevAccount]);
};
