# NexusAI 🤖✨

**NexusAI** is an advanced, enterprise-ready Generative AI SaaS platform. Built with a "Security-First" and "High-Availability" mindset, it provides a suite of professional AI tools powered by **Next.js 16**, **React 19**, and a sophisticated **Multi-Layer Redis Architecture**.

---

## 🎯 The Problem & Our Solution

### The Fragmented AI Landscape

Today, users and developers face a "Subscription Fatigue" and fragmented workflow—switching between 10+ different AI sites for text, code, images, and resume reviews. Most open-source AI wrappers are also vulnerable to **Database DDOS**, **Cache Stampedes**, and **OOM crashes** when they go viral.

### Our Solution: The Nexus Engine

NexusAI solves this by consolidating the most powerful AI capabilities into a **single, unified command center**.

1. **Vertical Integration**: One subscription (Free/Pro/Premium) gives you access to the entire AI lifecycle—from brainstorming articles to generating code and polishing your professional resume.
2. **Infrastructure Resilience**: We don't just "wrap" an API. We've built an **Enterprise-Grade Caching Core** using Bloom Filters and Request Coalescing to ensure that the platform stays fast and cost-effective, even under massive concurrent load.
3. **Usage Guard Intelligence**: Real-time monitoring and automated quota resets ensure fair usage while protecting your API overhead.

---

## 🚀 The Multi-Layer Defense Architecture (New v2.0)

Unlike standard SaaS starters, NexusAI is hardened against modern attack vectors and bottlenecks:

- **🛡️ Bloom Filter Firewall:** Protects the database from "Cache Penetration" attacks by blocking requests for non-existent IDs at the edge.
- **⛓️ Request Coalescing:** Eliminates "Cache Stampedes." If 1,000 users hit an expired key simultaneously, only **one** database query is executed.
- **⚡ L1/L2 Hybrid Caching:** Data lives in **Process Memory (L1)** for <1ms access and **Redis (L2)** for global persistence.
- **📉 Intelligent TTL & Jitter:** Prevents "Thundering Herd" database spikes by randomizing cache expiration windows.
- **📦 Storage Compression:** Uses field projection to keep the Redis memory footprint 90% lighter.

---

## 🚀 Features

### 🧠 AI Powerhouse

Access a diverse range of generative tools powered by **LangChain** and **Google Gemini**:

- **📝 Article Writer**: Generate SEO-optimized blog posts and articles.
- **🎨 Image Generation**: Create stunning visuals from text prompts (via Pollinations AI).
- **🖼️ Background Removal**: Instantly remove backgrounds from images.
- **🧹 Object Removal**: Clean up images by removing unwanted objects.
- **💻 Code Generator**: Generate clean, efficient code snippets in any language.
- **📄 Resume Reviewer**: Get AI-powered feedback to improve your CV.
- **🔍 Text Summarizer**: Condense long documents into concise summaries.
- **🏷️ Title Generator**: Create catchy headlines for your content.

### 💳 Monetization & Usage

- **Tiered Subscriptions**: Free, Pro, and Premium plans integrated via **Stripe**.
- **Usage Tracking**: Real-time tracking of daily/monthly limits per tool.
- **Automated Resets**: Cron jobs to reset usage quotas automatically.

### 🛡️ Security & Auth

- **Better-Auth Integration**: Secure authentication with Google OAuth and Email/Password.
- **Two-Factor Authentication (2FA)**: Enhanced security for user accounts.
- **Role-Based Access**: Protected routes and API endpoints.

---

## 🛠️ Modern Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Database**: [MongoDB](https://www.mongodb.com/) with Mongoose (Optimized with Lean Queries)
- **Caching**: [Redis (ioredis)](https://redis.io/) with Bloom Filter support (Redis Stack/Upstash)
- **Payments**: [Stripe](https://stripe.com/) (Subscription Tiers & Webhooks)
- **File Storage**: [UploadThing](https://uploadthing.com/) & [ImageKit](https://imagekit.io/)
- **Logging**: High-performance logging with [Pino](https://github.com/pinojs/pino)

---

## ⚡ Getting Started

### 1. Environment Configuration

Copy the `.env.example` file to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 2. Installation & Build

```bash
npm install
npm run build
npm run start
```

---

## 📂 Architecture Overview

```text
├── app/api/       # Multi-layer cached API endpoints
├── lib/           # Enterprise Cache Engine, ACL, and Auth Client
├── middleware/    # Usage quotas and Auth protection
├── models/        # Mongoose schemas with indexing
└── components/    # Atomic UI components with Tailwind 4
```

---

## 🤝 Roadmap & Contributing

NexusAI is built for scale. Contributions regarding new AI models or performance optimizations are welcome.

1. Fork it → 2. Branch it → 3. PR it.
