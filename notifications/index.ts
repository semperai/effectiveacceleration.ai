import express from "express";
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
  const options = {
    TTL: req.body.ttl,
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

console.log("Service started at http://localhost:9000");
app.listen(9000);
