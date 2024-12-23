// Register a Service Worker.
const registrationPromise = navigator.serviceWorker.register('./service-worker.js');

document.getElementById('allow').onclick = async function() {
  const registration = await registrationPromise;
  let subscription = await registration.pushManager.getSubscription();

    // If a subscription was found, return it.
  if (!subscription) {
    // Get the server's public key
    const response = await fetch('http://localhost:9000/vapidPublicKey');
    const vapidPublicKey = await response.text();
    // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
    // urlBase64ToUint8Array() is defined in /tools.js
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
    // send notifications that don't have a visible effect for the user).
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    const json = subscription.toJSON();
    json.address = "0x00";

    // Send the subscription details to the server using the Fetch API.
    await fetch('http://localhost:9000/register', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        subscription: json
      }),
    });
  }

  document.getElementById('doIt').onclick = function() {
    const payload = document.getElementById('notification-payload').value;
    const delay = document.getElementById('notification-delay').value;
    const ttl = document.getElementById('notification-ttl').value;

    // Ask the server to send the client a notification (for testing purposes, in actual
    // applications the push notification is likely going to be generated by some event
    // in the server).
    fetch('http://localhost:9000/sendNotification', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        subscription: subscription,
        payload: payload,
        delay: delay,
        ttl: ttl,
      }),
    });
  };
}