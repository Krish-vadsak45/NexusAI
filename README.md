# NexusAI 🤖✨

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis)
![Stripe](https://img.shields.io/badge/Stripe-SaaS-635BFF?style=for-the-badge&logo=stripe)

**NexusAI** is a high-performance, enterprise-ready Generative AI SaaS platform engineered for scalability, security, and extreme availability. Powered by a sophisticated **Multi-Layer Defensive Caching Architecture**, it offers a unified suite of professional AI tools designed to survive viral growth and adversarial load.

---

## 💎 Core Features & Engineering Solutions

### 🧠 Unified AI Powerhouse
NexusAI consolidates the fragmented AI landscape into one seamless, high-performance command center.
- **📝 Article Writer & SEO Engine**: Generates comprehensive content packages including Markdown articles, SEO meta-data, and automated Twitter/LinkedIn threads via **Gemini 2.5 Flash**.
- **🎨 Visual Intelligence**: Professional-grade **Background Removal**, **Object Removal**, and **AI Image Generation** (via Pollinations AI).
- **💻 Developer Suite**: Context-aware **Code Generation** and **Resume Reviewer** with AI-driven optimization feedback.
- **🔍 Content Processing**: High-speed **Text Summarization** and **Catchy Title Generation**.

### 🛡️ Enterprise-Grade Authentication (Better-Auth)
Hardened security layer protecting user data and intellectual property.
- **Multi-Factor Security**: Native **Two-Factor Authentication (2FA)** and **Magic Link** support for passwordless entry.
- **Social Integration**: Seamless **Google OAuth** integration with automatic profile provisioning.
- **RBAC & ACL**: Granular **Role-Based Access Control** ensuring data isolation between Free, Pro, and Premium tiers.

### ⚡ The "Indestructible" Redis & Caching Layer
We solve the critical scalability bottlenecks that cause standard SaaS platforms to crash under load.
- **🛡️ Bloom Filter Firewall (L3 Defense)**: Uses Redis Stack Bloom Filters to check for resource existence before hitting the database, neutralizing **Cache Penetration** attacks.
- **⛓️ Request Coalescing (Stampede Protection)**: Ensures that only **one** backend query is executed even if thousands of concurrent users hit an expired cache key simultaneously.
- **⚡ L1/L2 Hybrid Strategy**: 
  - **L1 (In-Memory)**: Sub-microsecond access for hyper-frequent reads within the node process.
  - **L2 (Distributed Redis)**: Global persistence with **Intelligent TTL Jitter** to prevent synchronized cache expirations (Thundering Herd effect).
- **📉 Storage Optimization**: Field projection and payload compression keep the Redis memory footprint 90% lighter than standard implementations.
- **🔄 Stale-While-Revalidate (SWR)**: Background revalidation logic for metrics and dashboard data, ensuring zero-latency user experiences while keeping data fresh.

### 📊 Professional Data Management
- **📑 Ubiquitous Pagination & Cursors**: Every list—from **Admin Users** to **Project Members** and **Tool History**—is protected by sophisticated **Cursor-based** or **Offset-based pagination**. This prevents OOM (Out of Memory) crashes and ensures snappy performance regardless of dataset size.
- **🔎 Global Search & Filtering**: Sub-second search across projects, users, and AI history powered by optimized MongoDB indexes and regex escaping.
- **⏳ Real-Time Usage Monitoring**: Polling-based usage dashboard with a 30s heartbeat, providing users with a "live" sense of their remaining quotas.
- **📁 Advanced Project Workspace**: Multi-user collaboration within "Projects," allowing shared AI assets and team member management with delegated roles.

### 💎 Unique Scalability Solutions
- **Atomic Usage Guard**: Database-level atomic increments for tool usage tracking, preventing quota overruns during concurrent API bursts.
- **Automatic Quota Resets**: Intelligent UTC-synchronized cron jobs that reset daily/monthly limits without manual intervention.
- **Resilient Fallbacks**: Integrated "No-op" cache clients that allow the platform to stay functional even if the Redis cluster is temporarily unreachable.
- **📧 Intelligent Notification Engine**: Built-in system for project invites and usage alerts, featuring server-side enrichment for associated user data.

---

## 🛠️ The Nexus Stack

- **Core:** [Next.js 16 (App Router)](https://nextjs.org/) & [React 19 (Server Components)](https://react.dev/)
- **Auth:** [Better-Auth](https://better-auth.com/) (Google OAuth, 2FA, Magic Links, Email/Password)
- **Database:** [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) (Optimized with lean queries and indexing)
- **Caching:** [Redis (ioredis)](https://redis.io/) + Custom L1 In-Memory Engine
- **AI Engine:** [LangChain](https://js.langchain.com/) + [Google Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/)
- **Media:** [UploadThing](https://uploadthing.com/), [ImageKit](https://imagekit.io/), and [Cloudinary](https://cloudinary.com/)
- **Observability:** [Pino](https://getpino.io/) High-performance JSON logging

---

## 📂 Architecture Breakdown

```text
├── app/
│   ├── api/ai/      # Scalable AI tool endpoints with usage protection
│   └── (auth)/      # Advanced authentication workflows (2FA, etc.)
├── features/        # Domain-driven modules (Billing, Projects, Admin)
├── lib/             # The Core: Cache Engine, ACL, and Utility layer
├── middleware/      # Global usage guard and security filters
└── models/          # Optimized Mongoose schemas (Audit, Usage, User)
```

---

## ⚡ Deployment & Setup

### 1. Prerequisites
- Node.js 20+
- MongoDB Instance
- Redis Instance (Redis Stack recommended for Bloom Filter support)

### 2. Environment Configuration
Create a `.env` file with the following keys:
```bash
# Core
MONGODB_URI=
REDIS_URL=

# Auth
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI & Media
GEMINI_API_KEY=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 3. Installation
```bash
npm install
npm run build
npm run start
```

---

## 📜 License & Contribution

NexusAI is built for scale. We welcome contributions that focus on performance optimization and new vertical AI integration.

1. Fork → 2. Branch → 3. PR.

