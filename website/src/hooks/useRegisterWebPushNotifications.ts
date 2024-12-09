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
  if (!prevAddress) {
    prevAddress =
      localStorage.getItem('WebPushNotificationsAddress') ?? undefined;
  }

  const registration = (await navigator.serviceWorker.getRegistration())!;
  let subscription = await registration.pushManager.getSubscription();

  if (subscription && address !== prevAddress) {
    console.log(
      'Unsubscribing from existing web push notifications subscription'
    );
    await subscription.unsubscribe();
    localStorage.removeItem('WebPushNotificationsAddress');
    subscription = null;
  }
  // If a subscription was found, return it.
  if (!subscription && address) {
    console.log('Registering for web push notifications');
    // Get the server's public key
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PUSH_SERVICE_URL}/vapidPublicKey`
    );
    const vapidPublicKey = await response.text();
    // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
    // urlBase64ToUint8Array() is defined in /tools.js
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // check perfmissions
    if (
      (await registration.pushManager.permissionState({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      })) === 'denied'
    ) {
      return;
    }

    // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
    // send notifications that don't have a visible effect for the user).
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    const json = subscription.toJSON();
    (json as any).address = address;

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

      if (address) {
        localStorage.setItem('WebPushNotificationsAddress', address);
      } else {
        localStorage.removeItem('WebPushNotificationsAddress');
      }
    } catch {
      localStorage.removeItem('WebPushNotificationsAddress');
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

  console.log("Unsubscribing from web push notifications");

  await subscription.unsubscribe();
  localStorage.removeItem('WebPushNotificationsAddress');
}

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
      if (!account && !prevAccount) {
        return;
      }

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
