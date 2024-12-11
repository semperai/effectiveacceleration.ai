//@ts-nocheck
import parseDbUrl from "parse-database-url";
import pg from "pg";
import format from "pg-format";

export interface IPushSubscription {
  id?: number,
  address: string, // address must be checksummed
  endpoint: string,
  expirationTime: number | null,
  keys: {
    p256dh: string,
    auth: string,
  },
}

export default class SqlProvider {
  public db: pg.Pool;
  public config: any;
  public formatter: any;
  public isInit = false;

  public constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "Set process.env.DATABASE_URL in form postgresql://user:password@host:port/dbname, e.g. export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres",
      );
    }
    let dbConfig = parseDbUrl(process.env.DATABASE_URL);
    this.config = dbConfig;

    const Pool = pg.Pool;
    this.db = new Pool(dbConfig);
    this.formatter = format;
  }

  public async init(): Promise<this> {
    if (!this.isInit) {
      this.isInit = true;
      this.db;
      this.formatter;
    }

    return this;
  }

  public async close(): Promise<this> {
    await this.db.end();
    return this;
  }

  public async addSubscription(subscription: IPushSubscription) {
    const text = this.formatter(
      "INSERT into push_subscription (address,endpoint,expiration_time,keys) VALUES ($1, $2, $3, $4::jsonb);",
    );
    return await this.db.query(text, [subscription.address, subscription.endpoint, subscription.expirationTime, JSON.stringify(subscription.keys)]);
  }

  public async getAllSubscriptions(): Promise<IPushSubscription[]> {
    const text = "SELECT * from push_subscription";
    const res = await this.db.query(text);
    return res.rows.map((row) => ({
      id: row.id,
      address: row.address,
      endpoint: row.endpoint,
      expirationTime: row.expiration_time,
      keys: row.keys,
    }));
  }

  public async getSubscriptionsForManyAddresses(addresses: string[]): Promise<IPushSubscription[]> {
    const text = this.formatter("SELECT * FROM push_subscription WHERE address IN (%L);", addresses);
    const res = await this.db.query(text);
    return res.rows.map((row) => ({
      id: row.id,
      address: row.address,
      endpoint: row.endpoint,
      expirationTime: row.expiration_time,
      keys: row.keys,
    }));
  }

  public async getAddressSubscriptions(address: string): Promise<IPushSubscription[]> {
    const text = "SELECT * from push_subscription WHERE address = $1";
    const res = await this.db.query(text, [address]);
    return res.rows.map((row) => ({
      id: row.id,
      address: row.address,
      endpoint: row.endpoint,
      expirationTime: row.expiration_time,
      keys: row.keys,
    }));
  }

  public async removeSubscriptionsByIds(ids: number[]) {
    const text = this.formatter("DELETE from push_subscription WHERE id IN (%L);", ids);
    return await this.db.query(text);
  }
}
