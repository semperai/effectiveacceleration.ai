//@ts-nocheck
import parseDbUrl from "parse-database-url";
import pg from "pg";
import format from "pg-format";

export interface IPushSubscription {
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
    let text = this.formatter(
      "INSERT into push_subscription (address,endpoint,expiration_time,keys) VALUES ($1, $2, $3, $4::jsonb);",
    );
    return await this.db.query(text, [subscription.address, subscription.endpoint, subscription.expirationTime, JSON.stringify(subscription.keys)]);
  }
}
