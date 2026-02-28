# ImperiumX API Contracts

This document specifies the backend API contracts supporting the redesigned Browse experience and the code‑based referral program. All endpoints return JSON and must set appropriate CORS and authentication headers. All write operations require authentication; staff endpoints additionally require `role ∈ {staff, ceo}`.

## 1. Accounts

### 1.1 Schema

Account object (fields returned by GET /accounts and accepted by PATCH /accounts/:id):

- id: string (stable unique identifier, e.g., "VAL-001")
- game: "valorant" | "fortnite" | "other"
- level: number
- skinsCount: number
- rank: string
- region: string (e.g., "NA", "EU", "APAC")
- winRate: number (0–100, integer or float)
- price: number (optional)
- originalPrice: number (optional)
- skinNames: string[] | string (comma‑separated string acceptable for backward compatibility)
- descriptionHtml: string (rich‑text HTML, staff‑editable)
- rankHistory: string (plain text; staff‑editable)
- updatedAt: ISO string

### 1.2 Endpoints

GET /accounts
- Auth: public
- Query params (optional): `game`, `region`, pagination if needed in future
- Returns: `Account[]`

PATCH /accounts/:id
- Auth: staff only
- Body (partial allowed): `{ descriptionHtml?: string, rankHistory?: string, skinNames?: string[] | string, level?: number, rank?: string, winRate?: number, region?: string, price?: number, originalPrice?: number }`
- Behavior: partial update; returns updated `Account`
- Concurrency: use DB row locking; optionally support `If-Match` ETag to avoid lost updates

## 2. Referral (Code‑Based)

### 2.1 Requirements

1) Generate a unique, 8‑character alphanumeric referral code for every existing user. Codes are case‑insensitive; store uppercase. Uniqueness must be enforced by a DB unique index.

2) Registration accepts an optional `referralCode`. On success with a valid code, persist the code owner’s `userId` as the new user’s `referredBy` (nullable) on the users table.

3) After each successful purchase, compute commission and credit referrer’s internal wallet; append immutable ledger.

4) Idempotency: The post‑purchase process must be idempotent and executed inside a DB transaction; duplicate credits must be impossible.

### 2.2 Schema

User:
- id: string
- username: string
- email: string
- role: "user" | "staff" | "ceo"
- referralCode: string (8 uppercase alphanumeric, unique, non‑nullable)
- referredBy: string | null (userId of referrer)
- walletBalance: number (internal store credit, dollars)

LedgerEntry (immutable):
- transactionId: string (UUID v4, unique)
- purchaseId: string (unique; DB unique index)
- referrerId: string (userId)
- amount: number (commission in dollars)
- timestamp: ISO string
- meta: object (optional; e.g., percentage used)

### 2.3 Endpoints

GET /referral
- Auth: user
- Returns: `{ referralCode: string, totalReferrals: number, totalEarnings: number, totalPoints: number }`

POST /auth/register
- Body: `{ username, email, password, referralCode? }`
- Behavior:
  - If `referralCode` present, validate `/^[A-Z0-9]{8}$/` and case‑fold to uppercase.
  - If valid and found, set `referredBy` on the new user.
  - Generate a token and return `{ token, user }` as today.

### 2.4 Post‑Purchase Commission (Event Listener / Service)

Trigger: After a purchase moves to `paid` or `completed` state.

Algorithm (transactional, idempotent):
1. Identify buyer `userId` and look up `referredBy`. If null, exit.
2. Determine commission percentage (e.g., 25%/30%/35% per your business rules).
3. Compute `commission = round(purchase.amount * pct, 2)`.
4. Start DB transaction:
   - Ensure no existing `LedgerEntry` with the same `purchaseId` (unique index).
   - Insert `LedgerEntry { transactionId: uuid(), purchaseId, referrerId: referredBy, amount: commission, timestamp: now }`.
   - Increment referrer’s `walletBalance` by `commission`.
5. Commit.

Refunds / chargebacks:
- On refund, create a reversing `LedgerEntry` (negative amount) and decrement walletBalance atomically.

Idempotency:
- Enforce unique index on `LedgerEntry.purchaseId`. If the listener is triggered multiple times, the second attempt fails on insert; treat as success/no‑op.

Security:
- Only server computes and credits commissions.
- All wallet mutations must go through the ledger pathway.

## 3. Validation & Testing Expectations

Unit tests (backend):
- Registration with invalid referral code is rejected.
- Duplicate or replay of purchase event does not create duplicate credits (idempotency test).
- Concurrent events for same `purchaseId` result in exactly one ledger entry and one credit.
- Refund scenario creates a reversing entry and balances are correct.

End‑to‑end (Cypress or equivalent):
- Register B with A’s referral code; complete a qualifying purchase; assert A’s wallet increases exactly once and ledger has one row.
- Replaying the purchase notification does not alter balances.

## 4. Notes
- Frontend sends `referralCode` on registration when provided and uppercase validated.
- Profile and Referral pages expect `GET /referral` to return the user’s code and summary.
- Browse admin editing writes `descriptionHtml` and `rankHistory` via PATCH.

