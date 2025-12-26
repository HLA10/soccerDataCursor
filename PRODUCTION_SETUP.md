# Production Database Setup Guide

## Problem
Your production database (on Vercel) is separate from your local database. The admin user you created locally doesn't exist in production.

## Solution: Two Steps

### Step 1: Run Database Migrations on Production

You need to run Prisma migrations on your production database to create all the tables.

**Option A: Using Vercel CLI (Recommended)**

1. Install Vercel CLI (if not already installed):
   ```powershell
   npm install -g vercel
   ```

2. Login to Vercel:
   ```powershell
   vercel login
   ```

3. Link your project (if not already linked):
   ```powershell
   cd C:\Projects\SoccerDataCursor
   vercel link
   ```

4. Pull environment variables to get production DATABASE_URL:
   ```powershell
   vercel env pull .env.production
   ```

5. Set DATABASE_URL temporarily and run migrations:
   ```powershell
   $env:DATABASE_URL = (Get-Content .env.production | Select-String "DATABASE_URL").ToString().Split("=")[1]
   npx prisma migrate deploy
   ```

**Option B: Using Vercel Dashboard**

1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Copy your `DATABASE_URL` value
4. In your local terminal, set it temporarily:
   ```powershell
   $env:DATABASE_URL = "your-production-database-url-here"
   npx prisma migrate deploy
   ```

### Step 2: Create Admin User in Production

After migrations are complete, create the admin user:

**Option A: Using Vercel CLI**

1. Make sure you have the production DATABASE_URL set:
   ```powershell
   $env:DATABASE_URL = (Get-Content .env.production | Select-String "DATABASE_URL").ToString().Split("=")[1]
   ```

2. Run the create-admin script:
   ```powershell
   node scripts/create-admin.js admin@example.com admin123456 "Admin User"
   ```

**Option B: Manual Setup**

1. Get your production DATABASE_URL from Vercel dashboard
2. Set it in your terminal:
   ```powershell
   $env:DATABASE_URL = "your-production-database-url-here"
   ```

3. Create admin user:
   ```powershell
   node scripts/create-admin.js admin@example.com admin123456 "Admin User"
   ```

## Quick One-Liner (If you have Vercel CLI)

```powershell
# Pull env vars, run migrations, create admin
vercel env pull .env.production
$env:DATABASE_URL = (Get-Content .env.production | Select-String "DATABASE_URL").ToString().Split("=")[1]
npx prisma migrate deploy
node scripts/create-admin.js admin@example.com admin123456 "Admin User"
```

## Verify It Worked

After completing both steps, try logging in at your Vercel URL:
- Email: `admin@example.com`
- Password: `admin123456`

## Troubleshooting

**Error: "Database does not exist"**
- Make sure your DATABASE_URL is correct
- Check that your database provider (Neon, etc.) has the database created

**Error: "Migration failed"**
- Make sure you're using the production DATABASE_URL, not local
- Check database connection string includes `?sslmode=require` for production

**Error: "User already exists"**
- The admin user was already created
- Try logging in with the credentials


