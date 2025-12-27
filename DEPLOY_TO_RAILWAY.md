# Deploy to Railway - Step by Step Guide

## Why Railway?
- ✅ Simpler than Vercel
- ✅ Built-in PostgreSQL database (no separate Neon setup needed)
- ✅ Better error logging and debugging
- ✅ Environment variables are easier to manage
- ✅ Free tier available
- ✅ Can have it running in 30 minutes

## Step 1: Sign Up for Railway

1. Go to: https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (easiest way)

## Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository: `HLA10/soccer-data-cursor101`
4. Railway will auto-detect Next.js

## Step 3: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database"
3. Select "PostgreSQL"
4. Railway will create a PostgreSQL database automatically
5. **Copy the DATABASE_URL** (you'll need it)

## Step 4: Set Environment Variables

1. Go to your service (the Next.js app)
2. Click "Variables" tab
3. Add these variables:

**DATABASE_URL:**
- Click "New Variable"
- Name: `DATABASE_URL`
- Value: Copy from the PostgreSQL service (click on it → Variables → `DATABASE_URL`)
- Click "Add"

**NEXTAUTH_SECRET:**
- Click "New Variable"
- Name: `NEXTAUTH_SECRET`
- Value: `S3hZosW4BZjY8FR22NcEFTsT+9GkwhrPNc5BrozXDhk=`
- Click "Add"

**NEXTAUTH_URL:**
- Click "New Variable"
- Name: `NEXTAUTH_URL`
- Value: `https://your-app-name.up.railway.app`
- (Replace with your actual Railway URL - you'll get it after first deploy)
- Click "Add"

## Step 5: Deploy

1. Railway will automatically deploy when you connect the repo
2. Wait for deployment to complete (2-3 minutes)
3. Click "Settings" → "Generate Domain" to get your URL

## Step 6: Run Migrations

1. Go to your PostgreSQL service
2. Click "Query" tab
3. Or use Railway CLI:
   ```bash
   railway run npx prisma migrate deploy
   ```

## Step 7: Create Admin User

After migrations run, create the admin user:

1. Go to your Next.js service
2. Click "Variables" tab
3. Make sure `DATABASE_URL` is set (should be auto-linked)
4. Use Railway CLI or run locally with Railway DATABASE_URL:

```bash
# Get DATABASE_URL from Railway PostgreSQL service
railway variables
# Then run:
DATABASE_URL="your-railway-db-url" node scripts/reset-admin-sql.js
```

## Step 8: Test Login

1. Go to your Railway app URL
2. Try logging in:
   - Email: `admin@example.com`
   - Password: `admin123456`

## Advantages of Railway

- ✅ Everything in one place (database + app)
- ✅ Better error logs (easier to debug)
- ✅ Simpler environment variable management
- ✅ Automatic deployments from GitHub
- ✅ Free tier available
- ✅ Better for debugging database issues

## If You Need Help

Railway has excellent documentation and support. The setup is much simpler than Vercel + Neon.


