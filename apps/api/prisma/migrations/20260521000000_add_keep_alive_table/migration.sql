-- CreateTable
CREATE TABLE "keep_alive" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "pinged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keep_alive_pkey" PRIMARY KEY ("id")
);

-- Enable RLS and allow anon upsert
ALTER TABLE "keep_alive" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon upsert" ON "keep_alive"
    FOR ALL USING (true) WITH CHECK (true);
