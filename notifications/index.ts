import express from "express";
import basicAuth from 'express-basic-auth'
import cors from "cors";
import webPush from "web-push";
import SqlProvider, { IPushSubscription } from "./SqlProvider";
import { config } from 'dotenv';
config();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.log(
    "You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY " +
      "environment variables. You can use the following ones:"
  );
  const keys = webPush.generateVAPIDKeys();
  console.log(`export VAPID_PUBLIC_KEY=${keys.publicKey}; export VAPID_PRIVATE_KEY=${keys.privateKey};`);
  process.exit(1);
}

const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

if (!AUTH_USER || !AUTH_PASSWORD) {
  console.log(
    "You must set the AUTH_USER and AUTH_PASSWORD " +
      "environment variables."
  );
  process.exit(1);
}


// Set the keys used for encrypting the push messages.
webPush.setVapidDetails(
  "https://effectiveacceleration.ai",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);


const provider = new SqlProvider();
provider.init();


const app = express();
app.use(express.json());
app.use(cors());

// return the public key to the caller
app.get("/vapidPublicKey", function (req, res) {
  res.send(process.env.VAPID_PUBLIC_KEY);
});

// register the subscription with the provider targeting remote subsquid which actually send push notifications
// req.body.subscription.address must be checksummed
app.post("/register", async function (req, res) {
  // A real world application would store the subscription info.
  await provider.addSubscription(req.body.subscription as IPushSubscription);
  res.sendStatus(201);
});

// a testing endpoint to send a notification back to caller
app.post("/sendNotification", function (req, res) {
  const subscription = req.body.subscription;
  const payload = req.body.payload;
  const options: webPush.RequestOptions = {
    timeout: 10 * 1000, // 10 seconds to fail the request
    TTL: 10 * 60, // 10 minutes to store our message on the push server
  };

  setTimeout(function () {
    webPush
      .sendNotification(subscription, payload, options)
      .then(function () {
        res.sendStatus(201);
      })
      .catch(function (error) {
        res.sendStatus(500);
      });
  }, req.body.delay * 1000);
});

// host super simple test page
app.use(express.static("webtest"));

// all routes below will require basic auth
app.use(basicAuth({
  users: { [AUTH_USER]: AUTH_PASSWORD },
}));

type BroadcastMessage = { text: string, href?: string };

export const broadcastNotification = async (message: BroadcastMessage) => {
  const payload = JSON.stringify(message);
  console.log(`Broadcasting to everyone: '${payload}'`);

  const subscriptions = await provider.getAllSubscriptions();
  const idsToRemove: number[] = [];
  let sent = 0;
  let failed = 0;
  let removed = 0;

  // sequentially send notifications to all subscriptions to avoid overloading the push server
  for (const subscription of subscriptions) {
    const options: webPush.RequestOptions = {
      timeout: 10 * 1000, // 10 seconds to fail the request
      TTL: 10 * 60, // 10 minutes to store our message on the push server
    };


    const tries = 5;
    for (const i of [...Array(tries).keys()].slice(1)) {
      try {
        await webPush.sendNotification(subscription, payload, options);
        console.log(`Push notification sent for address: ${subscription.address}`);
        sent += 1;
        break;
      } catch (e: any) {
        // console.debug(`Failed to send push notification for address: ${subscription.address}. Error: ${e.message}: ${e.statusCode}`);
        // trhottle the retries
        if ([503, 201, 202, 429].includes(e.statusCode)) {
          console.debug("Throttling with try: ", i);
          await new Promise((resolve) => setTimeout(resolve, 1000 * 1.5 ** i));
        }

        // invalid/expired subscription
        if ([404, 102, 410, 103, 105, 106].includes(e.statusCode)) {
          idsToRemove.push(subscription.id!);
          console.error(`Removing subscription for address: ${subscription.address} due to error: ${e.message}: ${e.statusCode}`);
          removed += 1;
          break;
        }

        if (i === tries) {
          console.error(`Failed to send push notification for address: ${subscription.address}. Error: ${e.message}: ${e.statusCode}`);
          failed += 1;
        }
      }
    }
  };

  if (idsToRemove.length) {
    await provider.removeSubscriptionsByIds(idsToRemove);
  }

  return { sent, failed, removed };
}

app.post("/broadcastNotification", async function (req, res) {
  const result = await broadcastNotification({
    text: req.body.text,
    href: req.body.href,
  });
  res.send(result);
});

console.log("Service started at http://localhost:9000");
app.listen(9000);
