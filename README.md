# NexusAI 🤖✨

**NexusAI** is a comprehensive, all-in-one SaaS platform that empowers users with a suite of generative AI tools. Built with the latest web technologies including **Next.js 16**, **React 19**, and **Tailwind CSS 4**, it features a robust subscription system, enterprise-grade security, and seamless AI integration.

![NexusAI Banner](https://via.placeholder.com/1200x400?text=NexusAI+Dashboard+Preview)

## 🚀 Features

### 🧠 AI Powerhouse
Access a diverse range of generative tools powered by **LangChain** and **Google Gemini**:
-   **📝 Article Writer**: Generate SEO-optimized blog posts and articles.
-   **🎨 Image Generation**: Create stunning visuals from text prompts (via Pollinations AI).
-   **🖼️ Background Removal**: Instantly remove backgrounds from images.
-   **🧹 Object Removal**: Clean up images by removing unwanted objects.
-   **💻 Code Generator**: Generate clean, efficient code snippets in any language.
-   **📄 Resume Reviewer**: Get AI-powered feedback to improve your CV.
-   **🔍 Text Summarizer**: Condense long documents into concise summaries.
-   **🏷️ Title Generator**: Create catchy headlines for your content.

### 💳 Monetization & Usage
-   **Tiered Subscriptions**: Free, Pro, and Premium plans integrated via **Stripe**.
-   **Usage Tracking**: Real-time tracking of daily/monthly limits per tool.
-   **Automated Resets**: Cron jobs to reset usage quotas automatically.

### 🛡️ Security & Auth
-   **Better-Auth Integration**: Secure authentication with Google OAuth and Email/Password.
-   **Two-Factor Authentication (2FA)**: Enhanced security for user accounts.
-   **Role-Based Access**: Protected routes and API endpoints.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/) (with Mongoose)
-   **Authentication**: [Better-Auth](https://www.better-auth.com/)
-   **Payments**: [Stripe](https://stripe.com/)
-   **AI Orchestration**: [LangChain](https://js.langchain.com/)
-   **File Storage**: [UploadThing](https://uploadthing.com/), [ImageKit](https://imagekit.io/), [Cloudinary](https://cloudinary.com/)
-   **Validation**: [Zod](https://zod.dev/)

## ⚡ Getting Started

### Prerequisites
-   Node.js (v18+)
-   MongoDB Database
-   Stripe Account
-   Google Cloud Console Project (for OAuth & Gemini)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Krish-vadsak45/NexusAI.git
    cd NexusAI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add the following:

    ```env
    # Database
    MONGODB_URI=your_mongodb_connection_string

    # Auth (Better-Auth)
    BETTER_AUTH_SECRET=your_generated_secret
    BETTER_AUTH_URL=http://localhost:3000
    
    # Google OAuth
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    # AI Services
    GEMINI_API_KEY=your_gemini_api_key
    POLLINATIONS_API_KEY=your_pollinations_key

    # Stripe
    STRIPE_SECRET_KEY=your_stripe_secret_key
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
    STRIPE_PRICE_ID_PRO=price_id_for_pro_plan
    STRIPE_PRICE_ID_PREMIUM=price_id_for_premium_plan

    # Image Services
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
    UPLOADTHING_TOKEN=...
    IMAGEKIT_PRIVATE_KEY=...
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

    ├── app/ # Next.js App Router pages & API routes
    │ ├── api/ # Backend API endpoints (AI, Auth, Stripe)
    │ ├── dashboard/ # User dashboard & tool interfaces
    │ └── (auth)/ # Authentication pages
    ├── components/ # Reusable UI components
    │ ├── ui/ # Shadcn UI primitives
    │ └── ... # Feature-specific components
    ├── lib/ # Utility functions & configurations
    │ ├── db.ts # Database connection
    │ ├── plans.ts # Subscription plan definitions
    │ └── stripe.ts # Stripe initialization
    ├── models/ # Mongoose database schemas
    ├── public/ # Static assets
    └── middleware/ # Auth & Usage protection middleware


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add ome AmazingFeature`) 
4.  Push to the branch (`git push origin feature/AmazingFeature`)

