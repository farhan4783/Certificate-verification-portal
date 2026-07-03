# 🚀 Deploying KodeToCareer Platform to Vercel

This guide provides step-by-step instructions to deploy the **KodeToCareer Certificate & Portfolio Verification Platform** live on Vercel with a production-ready PostgreSQL database.

---

## 📋 Prerequisites
Before you start, make sure you have:
1. A **GitHub**, **GitLab**, or **Bitbucket** account with this codebase pushed to a repository.
2. A **Vercel** account (free hobby tier is sufficient).
3. A **PostgreSQL** database instance (you can spin up a free database on [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or use Vercel's built-in PostgreSQL).

---

## 🛠️ Step-by-Step Deployment Guide

### Step 1: Set up your Database (e.g. Neon or Supabase)
Since the platform uses Prisma ORM with PostgreSQL, you need a live connection string:
1. Sign up/log in to [Neon](https://neon.tech/) or [Supabase](https://supabase.com/).
2. Create a new project/database.
3. Copy the **Connection String** (URI format), which looks like this:
   `postgresql://username:password@hostname:5432/dbname?sslmode=require`

---

### Step 2: Push Database Schema and Seed Data
Before building on Vercel, prepare your database schema and seed the initial Super Admin account:
1. Open your terminal in this project directory.
2. Create a temporary `.env` file in the project root containing your live connection string:
   ```env
   DATABASE_URL="your_copied_connection_string"
   JWT_SECRET="generate_a_random_jwt_secret_here"
   ```
3. Run the Prisma schema push command to build all tables:
   ```bash
   npx prisma db push
   ```
4. Run the seed script to create the default **Super Admin** account (`admin@kodetocareer.com` / `admin123`):
   ```bash
   npx prisma db seed
   ```

---

### Step 3: Configure `package.json` for Vercel
To ensure Vercel automatically generates the Prisma Client before building the pages, check that your build command includes client generation. In your `package.json`, Vercel runs the `build` script. We have configured the `postinstall` hook in Next.js to do this automatically:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```
*Note: This is already set up in the codebase.*

---

### Step 4: Import Project on Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New** > **Project**.
2. Connect your Git repository provider and import your project repository.
3. In the **Configure Project** step:
   * Keep **Framework Preset** as **Next.js**.
   * Leave root directory as default `./`.

---

### Step 5: Add Environment Variables in Vercel
In the project settings on Vercel, expand the **Environment Variables** section and add the following keys:

| Key | Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | The live PostgreSQL connection URI from Step 1. |
| `JWT_SECRET` | *[Random secure string]* | Secret used to sign session tokens. |

---

### Step 6: Deploy!
1. Click the **Deploy** button.
2. Vercel will fetch the repository, run `npm run postinstall` (generating Prisma client), build the routes, and deploy the application.
3. Once completed, Vercel will output a live domain link (e.g. `https://ktc-platform.vercel.app`).

---

## 🔒 Post-Deployment Security
1. Log in to the live portal using the seed credentials:
   * **URL**: `https://your-domain.vercel.app/login`
   * **Email**: `admin@kodetocareer.com`
   * **Password**: `admin123`
2. Go to the Admin/Trainer view and immediately change/update your passwords for production security.
