-- AlterTable
ALTER TABLE "visitor_locations" ALTER COLUMN "latitude" DROP NOT NULL;
ALTER TABLE "visitor_locations" ALTER COLUMN "longitude" DROP NOT NULL;
ALTER TABLE "visitor_locations" ALTER COLUMN "accuracy" DROP NOT NULL;

ALTER TABLE "visitor_locations" ADD COLUMN "permission" VARCHAR(32) NOT NULL DEFAULT 'unknown';
ALTER TABLE "visitor_locations" ADD COLUMN "country" VARCHAR(64);
ALTER TABLE "visitor_locations" ADD COLUMN "country_code" VARCHAR(8);
ALTER TABLE "visitor_locations" ADD COLUMN "region" VARCHAR(96);
ALTER TABLE "visitor_locations" ADD COLUMN "city" VARCHAR(96);
ALTER TABLE "visitor_locations" ADD COLUMN "timezone" VARCHAR(64);
ALTER TABLE "visitor_locations" ADD COLUMN "isp" VARCHAR(128);
ALTER TABLE "visitor_locations" ADD COLUMN "org" VARCHAR(128);
ALTER TABLE "visitor_locations" ADD COLUMN "asn" VARCHAR(64);
ALTER TABLE "visitor_locations" ADD COLUMN "network_type" VARCHAR(32);
ALTER TABLE "visitor_locations" ADD COLUMN "network_effective_type" VARCHAR(16);
ALTER TABLE "visitor_locations" ADD COLUMN "languages" VARCHAR(128);
ALTER TABLE "visitor_locations" ADD COLUMN "locale" VARCHAR(32);
ALTER TABLE "visitor_locations" ADD COLUMN "platform" VARCHAR(64);
ALTER TABLE "visitor_locations" ADD COLUMN "screen" VARCHAR(32);
ALTER TABLE "visitor_locations" ADD COLUMN "referrer" VARCHAR(512);

CREATE INDEX "visitor_locations_country_code_created_at_idx" ON "visitor_locations"("country_code", "created_at");
