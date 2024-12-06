import SqlProvider from "./SqlProvider";

const provider = new SqlProvider();

provider.init().then(async () => {
  // test expects empty db
  if (true) {
    const subsForRemoval = await provider.getAllSubscriptions();
    await provider.removeSubscriptionsByIds(subsForRemoval.map(sub => sub.id!));

    const empty = await provider.getAllSubscriptions();
    console.log(empty.length);
    if (empty.length !== 0) {
      console.error(empty.length !== 0);
      throw "error3";
    }

    const sub = {address: "address", endpoint: "endpoint", expirationTime: 123, keys: {auth: "auth", p256dh: "p256dh"}};
    await provider.addSubscription(sub);

    const subs = await provider.getAllSubscriptions();
    delete (subs[0] as any).id;
    if (JSON.stringify(subs[0]) !== JSON.stringify(sub)) {
      console.error(JSON.stringify(subs[0]), JSON.stringify(sub));
      throw "error1";
    }

    const addressSubs = await provider.getAddressSubscriptions("address");
    delete (addressSubs[0] as any).id;
    if (JSON.stringify(addressSubs[0]) !== JSON.stringify(sub)) {
      console.error(JSON.stringify(addressSubs[0]), JSON.stringify(sub));
      throw "error2";
    }
  }

  process.exit(0);
});
