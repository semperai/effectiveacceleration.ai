import SqlProvider from "./SqlProvider";

const provider = new SqlProvider();
provider.init().then(async () => {
  await provider.addSubscription({address: "address", endpoint: "endpoint", expirationTime: 123, keys: {p256dh: "p256dh", auth: "auth"}});
  process.exit(0);
});
