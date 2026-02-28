CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" text,
  "type" text NOT NULL,
  "meta" jsonb,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId","createdAt");
