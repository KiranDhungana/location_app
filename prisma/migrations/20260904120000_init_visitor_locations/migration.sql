-- CreateTable
CREATE TABLE "visitor_locations" (
    "id" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(512),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visitor_locations_created_at_idx" ON "visitor_locations"("created_at");

-- CreateIndex
CREATE INDEX "visitor_locations_ip_address_created_at_idx" ON "visitor_locations"("ip_address", "created_at");
