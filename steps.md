# 🚀 Deploying KodeToCareer Platform to Vercel with Neon Serverless Postgres

This guide provides step-by-step instructions to deploy the **KodeToCareer Certificate & Portfolio Verification Platform** live on Vercel using **Neon Serverless Postgres** — a production-grade, free-forever alternative to Supabase built for serverless Next.js apps and Prisma ORM.

---

## ⚡ Why Neon Postgres (Supabase Free Alternative)?

If you are looking for a **free, reliable, production-ready database alternative to Supabase**:
* **Neon.tech (Recommended)**: 
  * **Free Tier**: 0.5 GiB storage, 1 project, serverless compute with zero idle cost, instant branching, and built-in connection pooling via pgBouncer/Neon Proxy (`-pooler` connection mode).
  * **Serverless Optimized**: Perfectly tuned for Next.js API routes on Vercel without connection exhaustion errors.
* **Secondary Free Options**:
  * **Aiven for PostgreSQL**: Offers a 5 GB storage free tier with dedicated PostgreSQL instances.
  * **Tembo / CockroachDB Serverless**: Cloud PostgreSQL options compatible with Prisma.

---

## 📋 Prerequisites
Before starting, ensure you have:
1. A **GitHub**, **GitLab**, or **Bitbucket** account with this codebase pushed.
2. A **Vercel** account (free Hobby tier is sufficient).
3. A **Neon.tech** account (free signup at [neon.tech](https://neon.tech/)).

---

## 🛠️ Step-by-Step Deployment Guide

### Step 1: Create your Free Database on Neon.tech
1. Sign up or log in at [Neon.tech](https://neon.tech/).
2. Click **Create Project**.
3. Name your project (e.g. `ktc-certificate-platform`) and select your nearest region.
4. Once created, navigate to the **Dashboard** / **Connection Details**.
5. Copy your connection string:
   * **Pooled Connection String** (for `DATABASE_URL` in Next.js runtime on Vercel):
     `postgresql://username:password@ep-xyz-pooler.region.aws.neon.tech/neondb?sslmode=require`
   * **Direct Connection String** (if using `DIRECT_URL` for Prisma schema migrations):
     `postgresql://username:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require`

---

### Step 2: Push Database Schema and Seed Data Locally
Before building on Vercel, populate your live Neon database tables and seed the initial Super Admin account:

1. Open your terminal in this project root directory.
2. Create or update your `.env` file in the project root:
   ```env
   # Neon Pooled Connection String for runtime queries
   DATABASE_URL="postgresql://username:password@ep-xyz-pooler.region.aws.neon.tech/neondb?sslmode=require"

   # App JWT secret for auth cookies
   JWT_SECRET="super_secret_jwt_key_change_me_in_production"

   # App public domain (used for QR code links and social sharing)
   NEXT_PUBLIC_APP_URL="https://your-app-name.vercel.app"

   # (Optional) Cloudinary for production asset storage
   CLOUDINARY_CLOUD_NAME=""
   CLOUDINARY_API_KEY=""
   CLOUDINARY_API_SECRET=""

   # (Optional) Resend for transactional email dispatch
   RESEND_API_KEY=""
   RESEND_FROM_EMAIL="certificates@kodetocareer.com"
   ```
3. Run Prisma schema push to build all database tables:
   ```bash
   npx prisma db push
   ```
4. Run the seed script to create default demo accounts (Super Admin, Trainer, Student, Course):
   ```bash
   npx prisma db seed
   ```

---

### Step 3: Configure `package.json` for Vercel
Vercel automatically executes `npm run postinstall` during builds. Ensure your `package.json` contains:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```
*(This is already pre-configured in the codebase).*

---

### Step 4: Import & Deploy on Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/) and click **Add New** > **Project**.
2. Connect your Git repository provider and import `Certificate-verification-portal`.
3. In **Configure Project**:
   * **Framework Preset**: Next.js
   * **Root Directory**: `./`
4. Expand **Environment Variables** and add:

| Key | Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...-pooler...` | Neon pooled connection string |
| `JWT_SECRET` | `secure_random_string` | Secret for JWT cookie encryption |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Production app domain |
| `CLOUDINARY_CLOUD_NAME` | *(optional)* | For Cloudinary image/PDF storage |
| `CLOUDINARY_API_KEY` | *(optional)* | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | *(optional)* | Cloudinary API Secret |
| `RESEND_API_KEY` | *(optional)* | For live email notifications |

5. Click **Deploy**. Vercel will build the app, generate the Prisma client, and launch your live site!

---

## 🔒 Default Logins & Post-Deployment Checklist

After deployment finishes, test logging into your portal:

1. **Super Admin Console**:
   * **URL**: `https://your-domain.vercel.app/login`
   * **Email**: `admin@kodetocareer.com`
   * **Password**: `admin123`

2. **Trainer Console**:
   * **Email**: `trainer@kodetocareer.com`
   * **Password**: `trainer123`

3. **Student Portal**:
   * **Email**: `student@kodetocareer.com`
   * **Password**: `student123`

4. **Security Recommendation**: Change all default passwords immediately after initial login.

