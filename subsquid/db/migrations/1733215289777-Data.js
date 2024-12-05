module.exports = class Data1733215289777 {
    name = 'Data1733215289777'

    async up(db) {
        await db.query(`CREATE TABLE "marketplace" ("id" character varying NOT NULL, "marketplace_data" text NOT NULL, "version" integer NOT NULL, "unicrow_address" text NOT NULL, "unicrow_dispute_address" text NOT NULL, "unicrow_arbitrator_address" text NOT NULL, "treasury_address" text NOT NULL, "unicrow_marketplace_fee" integer NOT NULL, "paused" boolean NOT NULL, "owner" text NOT NULL, "job_count" integer NOT NULL, "user_count" integer NOT NULL, "arbitrator_count" integer NOT NULL, CONSTRAINT "PK_d9c9a956a1a45b27b56db53bfc8" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "job_event" ("id" character varying NOT NULL, "job_id" character varying NOT NULL, "type_" integer NOT NULL, "address_" text NOT NULL, "data_" text NOT NULL, "timestamp_" integer NOT NULL, "details" jsonb, CONSTRAINT "PK_d4439f70bd53ce8a8a2a9a783c7" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_86e9dff9bc845b831415e36ca4" ON "job_event" ("job_id") `)
        await db.query(`CREATE TABLE "job" ("id" character varying NOT NULL, "state" integer NOT NULL, "whitelist_workers" boolean NOT NULL, "roles" jsonb NOT NULL, "title" text NOT NULL, "tags" text array NOT NULL, "content_hash" text NOT NULL, "content" text NOT NULL, "multiple_applicants" boolean NOT NULL, "amount" numeric NOT NULL, "token" text NOT NULL, "timestamp" integer NOT NULL, "max_time" integer NOT NULL, "delivery_method" text NOT NULL, "collateral_owed" numeric NOT NULL, "escrow_id" numeric NOT NULL, "result_hash" text NOT NULL, "rating" integer NOT NULL, "disputed" boolean NOT NULL, "allowed_workers" text array NOT NULL, "event_count" integer NOT NULL, "last_job_event_id" character varying, CONSTRAINT "PK_98ab1c14ff8d1cf80d18703b92f" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_dad4a91055a12f13adb8808789" ON "job" ("last_job_event_id") `)
        await db.query(`CREATE TABLE "arbitrator" ("id" character varying NOT NULL, "address_" text NOT NULL, "public_key" text NOT NULL, "name" text NOT NULL, "bio" text NOT NULL, "avatar" text NOT NULL, "fee" integer NOT NULL, "settled_count" integer NOT NULL, "refused_count" integer NOT NULL, "timestamp" integer NOT NULL, CONSTRAINT "PK_7897f406c323f90687a8ab79270" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_601b2215ce2dcc35f960fd7ac2" ON "arbitrator" ("address_") `)
        await db.query(`CREATE TABLE "review" ("id" character varying NOT NULL, "user" text NOT NULL, "reviewer" text NOT NULL, "job_id" numeric NOT NULL, "rating" integer NOT NULL, "text" text NOT NULL, "timestamp" integer NOT NULL, "user_loaded_id" character varying, "reviewer_loaded_id" character varying, CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_534b9ccc62d81280da578de6fe" ON "review" ("user") `)
        await db.query(`CREATE INDEX "IDX_23c5378f0d7f35e38bb4489346" ON "review" ("reviewer") `)
        await db.query(`CREATE INDEX "IDX_dbc6f9e5ae28ffb7d8916243be" ON "review" ("job_id") `)
        await db.query(`CREATE INDEX "IDX_122917f80765ff03165e8adf24" ON "review" ("user_loaded_id") `)
        await db.query(`CREATE INDEX "IDX_e4f75968107e312b77a7884f51" ON "review" ("reviewer_loaded_id") `)
        await db.query(`CREATE TABLE "user" ("id" character varying NOT NULL, "address_" text NOT NULL, "public_key" text NOT NULL, "name" text NOT NULL, "bio" text NOT NULL, "avatar" text NOT NULL, "reputation_up" integer NOT NULL, "reputation_down" integer NOT NULL, "average_rating" integer NOT NULL, "number_of_reviews" integer NOT NULL, "timestamp" integer NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_a7a49331c32139b4df92d80213" ON "user" ("address_") `)
        await db.query(`CREATE TABLE "push_subscription" ("id" SERIAL, "address" text NOT NULL, "endpoint" text NOT NULL, "expiration_time" integer, "keys" jsonb, CONSTRAINT "PK_07fc861c0d2c38c1b830fb9cb5d" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_dbf2099d2875175a69ead0fbe7" ON "push_subscription" ("address") `)
        await db.query(`ALTER TABLE "job_event" ADD CONSTRAINT "FK_86e9dff9bc845b831415e36ca41" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_122917f80765ff03165e8adf24d" FOREIGN KEY ("user_loaded_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_e4f75968107e312b77a7884f510" FOREIGN KEY ("reviewer_loaded_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "marketplace"`)
        await db.query(`DROP TABLE "job_event"`)
        await db.query(`DROP INDEX "public"."IDX_86e9dff9bc845b831415e36ca4"`)
        await db.query(`DROP TABLE "job"`)
        await db.query(`DROP INDEX "public"."IDX_dad4a91055a12f13adb8808789"`)
        await db.query(`DROP TABLE "arbitrator"`)
        await db.query(`DROP INDEX "public"."IDX_601b2215ce2dcc35f960fd7ac2"`)
        await db.query(`DROP TABLE "review"`)
        await db.query(`DROP INDEX "public"."IDX_534b9ccc62d81280da578de6fe"`)
        await db.query(`DROP INDEX "public"."IDX_23c5378f0d7f35e38bb4489346"`)
        await db.query(`DROP INDEX "public"."IDX_dbc6f9e5ae28ffb7d8916243be"`)
        await db.query(`DROP INDEX "public"."IDX_122917f80765ff03165e8adf24"`)
        await db.query(`DROP INDEX "public"."IDX_e4f75968107e312b77a7884f51"`)
        await db.query(`DROP TABLE "user"`)
        await db.query(`DROP INDEX "public"."IDX_a7a49331c32139b4df92d80213"`)
        await db.query(`DROP TABLE "push_subscription"`)
        await db.query(`DROP INDEX "public"."IDX_dbf2099d2875175a69ead0fbe7"`)
        await db.query(`ALTER TABLE "job_event" DROP CONSTRAINT "FK_86e9dff9bc845b831415e36ca41"`)
        await db.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_122917f80765ff03165e8adf24d"`)
        await db.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_e4f75968107e312b77a7884f510"`)
    }
}
