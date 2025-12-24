# How to Add DATABASE_URL to Vercel

## The Problem
Your Vercel deployment doesn't have `DATABASE_URL` in environment variables, so it can't connect to your database.

## Solution: Add DATABASE_URL to Vercel

### Step 1: Get Your DATABASE_URL

1. Open your local `.env` file:
   - Location: `C:\Projects\SoccerDataCursor\.env`
   - Find the line: `DATABASE_URL=...`
   - Copy the **entire value** (everything after the `=`)

### Step 2: Add to Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Navigate to Environment Variables:**
   - Click **Settings** (top menu)
   - Click **Environment Variables** (left sidebar)

3. **Add New Variable:**
   - Click **"Add New"** button
   - **Key:** `DATABASE_URL`
   - **Value:** Paste your DATABASE_URL from Step 1
   - **⚠️ IMPORTANT:** If your URL doesn't end with `?sslmode=require`, add it:
     - Example: `postgres://user:pass@host/db?sslmode=require`
   - **Environment:** Select:
     - ✅ **Production** (required)
     - ✅ **Preview** (optional, but recommended)
     - ❌ Development (not needed)
   - Click **"Save"**

### Step 3: Redeploy

After adding the environment variable:

1. **Automatic:** Vercel will detect the change and may auto-redeploy
2. **Manual:** Go to **Deployments** → Click **"..."** on latest deployment → **Redeploy**

### Step 4: Run Database Setup

After redeployment, you still need to:
1. Run database migrations
2. Create admin user

See `QUICK_PRODUCTION_SETUP.md` for those steps.

## Example DATABASE_URL Format

```
postgresql://user:password@hostname:5432/database?sslmode=require
```

Or for Neon:
```
postgres://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

## Troubleshooting

**"Invalid connection string"**
- Make sure you copied the entire URL
- Check for special characters that need encoding
- Ensure it starts with `postgres://` or `postgresql://`

**"Connection refused"**
- Make sure your database allows connections from Vercel's IPs
- Check that `?sslmode=require` is added for production
- Verify your database is running and accessible

**"Database does not exist"**
- Make sure the database name in the URL is correct
- Check your database provider dashboard

