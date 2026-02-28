ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "discord" text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS "User_role_createdAt_idx" ON "User"("role","createdAt");
