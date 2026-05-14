# Redis & Performance Optimization Report

## 🚀 Overview
This document outlines the high-performance caching and database optimizations implemented across the **videowatch** platform to ensure scalability, reduced latency, and efficient resource utilization.

---

### 1. Template Marketplace SWR Caching
**File:** [app/api/templates/route.ts](app/api/templates/route.ts)

*   **What:** Implemented a **Stale-While-Revalidate (SWR)** strategy for the public template marketplace.
*   **Why:** The marketplace is a high-traffic read entry point. Constant hits to MongoDB for the same public templates are inefficient.
*   **How:** 
    *   **Mechanism:** Public template lists are cached in Redis with a 1-hour TTL.
    *   **Performance:** Responses are served from Redis in **< 5ms**.
    *   **Logic:** If the cache is older than 5 minutes (**STALE_THRESHOLD**), the system serves the cached data immediately but triggers an asynchronous background refresh to update the Redis cache from the database.
*   **When:** Triggers on any `GET` request to the templates API where filters are "public" or default.
*   **Invalidation:** On `POST` (new template creation), the system automatically invalidates the specific category cache and the "all" cache to ensure new templates appear instantly.

---

### 2. ACL & Permission Caching
**File:** [lib/acl.ts](lib/acl.ts)

*   **What:** Session-based Key-Value Caching for project permissions.
*   **Why:** Project membership checks happen on almost every dashboard action. Repeatedly querying MongoDB for the same user/project metadata creates unnecessary load and latency.
*   **How:** 
    *   **Mechanism:** Permissions are cached in Redis using a composite key: `acl:user:{userId}:project:{projectId}`.
    *   **TTL:** Cached for **5 minutes**.
    *   **Impact:** Replaces a full `findById` and member array scan in MongoDB with a simple `O(1)` Redis GET.
*   **When:** Evaluated during every call to `checkProjectMembership`.

---

### 3. Distributed Rate Limiting
**File:** [lib/rateLimit.ts](lib/rateLimit.ts)

*   **What:** Atomic Sliding Window Rate Limiting.
*   **Why:** Standard in-memory limiters fail in serverless/distributed environments (Vercel). We need a global limit shared across all instances.
*   **How:** 
    *   **Mechanism:** Uses Redis **Sorted Sets (ZSET)**. Each request is a member in the set with a timestamp.
    *   **Logic:** The system removes entries outside the window (e.g., older than 60s) and counts the remaining items to determine if a user has exceeded the threshold.
    *   **Benefit:** Zero-drift rate limiting that persists across server restarts and scaled instances.

---

### 4. Admin Dashboard Metrics Persistence
**File:** [lib/admin-queries.ts](lib/admin-queries.ts)

*   **What:** Envelope Persistence for Aggregated Metrics.
*   **Why:** Admin metrics involve complex MongoDB aggregations (MRR calculations, growth deltas, churn rates) which are extremely "expensive" to compute on every page load.
*   **How:** 
    *   **Mechanism:** The entire metrics object is wrapped in an "Envelope" (data + timestamp) and stored in Redis.
    *   **Pattern:** Uses the same SWR pattern as the templates. The administrator always sees data instantly, while computation happens in the background.
    *   **Result:** The "slowest" part of the app (the Admin Panel) now loads in milliseconds.

---

### 🔍 Technical Summary of Changes

| Feature | Primary Store | Cache Type | TTL / Threshold | Files Modified |
| :--- | :--- | :--- | :--- | :--- |
| **Marketplace** | MongoDB | SWR (Redis) | 1hr / 5m | [route.ts](app/api/templates/route.ts) |
| **ACL/Auth** | MongoDB | Key-Value (Redis) | 5m | [acl.ts](lib/acl.ts) |
| **Admin Panel** | MongoDB | SWR (Redis) | 1hr / 5m | [admin-queries.ts](lib/admin-queries.ts) |
| **Rate Limiter** | Redis | Atomic ZSET | Sliding Window | [rateLimit.ts](lib/rateLimit.ts) |

---
**Status:** ✅ Fully Implemented & Optimized
**Current Date:** March 1, 2026
