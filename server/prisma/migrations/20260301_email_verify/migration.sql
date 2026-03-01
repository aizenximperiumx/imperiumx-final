ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "emailVerified" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "verificationCode" text,
  ADD COLUMN IF NOT EXISTS "verificationExpires" timestamp(3);

CREATE INDEX IF NOT EXISTS "User_emailVerified_idx" ON "User"("emailVerified");
