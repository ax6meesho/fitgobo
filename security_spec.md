# Security Specification - Pulse AI Fitness

## 1. Data Invariants
- A user can only access their own profile.
- A user can only access their own workout history.
- Workout history must be tied to the authenticated user's ID.
- Users cannot modify the `createdAt` timestamp after creation.
- Workout durations must be positive numbers.

## 2. The "Dirty Dozen" Payloads (Red Team Tests)

| # | Target Path | Payload | Expected | Reason |
|---|-------------|---------|----------|--------|
| 1 | /users/attacker | { goal: "Fat Loss", "level": "Beginner", ... } | DENIED | Cannot write to another user's profile |
| 2 | /users/victim | GET request | DENIED | Cannot read another user's profile |
| 3 | /users/me/history/w1 | { workoutName: "God Mode", duration: 99999 } | DENIED | (If schema rules enforced) Excessive duration or invalid fields |
| 4 | /users/me | { isAdmin: true, goal: "..." } | DENIED | Schema doesn't allow 'isAdmin' field |
| 5 | /users/me/history/w1 | { duration: -10 } | DENIED | Duration must be positive |
| 6 | /users/me | { goal: "Cheat", level: "God" } | DENIED | Enum validation failure |
| 7 | /users/any/history | LIST request | DENIED | Cannot list another user's history |
| 8 | /users/me/history/w1 (Update) | { createdAt: "2000-01-01" } | DENIED | createdAt is immutable |
| 9 | /users/me | { goal: "Fat Loss", time: "1GB_STRING" } | DENIED | Size constraint on strings |
| 10 | /users/me | { "shadow_field": "secret" } | DENIED | Strict key count (hasOnly) |
| 11 | /users/me (Create) | { onboarded: true, email_verified: true } | DENIED | Spoofing verification state in doc |
| 12 | /users/me | { "onboarded": "YES" } | DENIED | Type mismatch (boolean expected) |

## 3. Test Runner (Draft)
```ts
// firestore.rules.test.ts (logic used for rules drafting)
// - Test 1: User A cannot read User B's profile
// - Test 2: User A can write own profile with valid schema
// - Test 3: User A cannot write profile with extra fields
```
