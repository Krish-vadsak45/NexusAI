# `lib/` Structure

`lib/` now contains shared infrastructure and cross-feature utilities.

## Folders

- `ai/`: AI generation and background job processing
- `api/`: shared API contracts and typed client helpers
- `errors/`: app error types and API error handling
- `validations/`: shared validation helpers

## Top-level shared modules

- `cache-utils.ts`, `rateLimit.ts`, `redisClient.ts`, `template-cache.ts`: cache and rate-limit infrastructure
- `db.ts`: database connection
- `logger.ts`, `observability.ts`, `stripe-webhook.ts`: monitoring and webhook support
- `shared-types.ts`: shared app types
- `history-utils.ts`, `notification-utils.ts`, `error-utils.ts`, `utils.ts`: small shared helpers
- `stripe.ts`, `uploadthing.ts`: third-party integration setup

## Rule

Feature-owned code should live under `features/*`.
`lib/` should not contain proxy wrapper files that only re-export feature modules.
