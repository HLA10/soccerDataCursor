# Reset Admin Password in Production Database

## The Problem
The password verification is failing because the admin user in the production Neon database doesn't have the correct password hash.

## Solution: Reset Admin Password

### Step 1: Get Your Production DATABASE_URL

1. Go to Vercel Dashboard
2. Select your project
3. Go to: **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. Copy the entire connection string

It should look like:
```
postgresql://neondb_owner:npg_3OEzI4MpaCTy@ep-orange-wildflower-agvaohm3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Step 2: Set DATABASE_URL in PowerShell

Open PowerShell in your project folder (`C:\Projects\SoccerDataCursor`) and run:

```powershell
$env:DATABASE_URL="postgresql://neondb_owner:npg_3OEzI4MpaCTy@ep-orange-wildflower-agvaohm3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**Important:** Replace with your actual DATABASE_URL from Vercel!

### Step 3: Run the Reset Script

```powershell
node scripts/reset-admin-production.js
```

### Step 4: Verify

The script will:
- ✅ Check if admin user exists
- ✅ Update the password to `admin123456`
- ✅ Set role to `ADMIN`
- ✅ Set status to `ACTIVE`

### Step 5: Test Login

Go to your Vercel deployment and try logging in:
- **Email:** `admin@example.com`
- **Password:** `admin123456`

## Alternative: Use Vercel CLI

If you have Vercel CLI installed, you can also run:

```powershell
vercel env pull .env.production
node scripts/reset-admin-production.js
```

This will pull the environment variables from Vercel automatically.


