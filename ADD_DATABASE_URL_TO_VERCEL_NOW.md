# Add DATABASE_URL to Vercel - Step by Step

## The Problem
Your Vercel deployment doesn't have `DATABASE_URL` set, so the app can't connect to the database. This is why login isn't working!

## Solution: Add DATABASE_URL to Vercel

### Step 1: Go to Environment Variables
1. Go to: https://vercel.com/huffmans-projects-53a3c96a/~/settings/environment-variables
2. Or navigate: **Your Project** → **Settings** → **Environment Variables**

### Step 2: Add DATABASE_URL
1. Click **"Add New"** or **"Add Environment Variable"**
2. **Key:** `DATABASE_URL`
3. **Value:** 
   ```
   postgresql://neondb_owner:npg_3OEzI4MpaCTy@ep-orange-wildflower-agvaohm3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
4. **Environment:** Select **Production**, **Preview**, and **Development** (or at least **Production**)
5. Click **Save**

### Step 3: Verify Other Variables
Make sure you also have:

**NEXTAUTH_SECRET:**
```
S3hZosW4BZjY8FR22NcEFTsT+9GkwhrPNc5BrozXDhk=
```

**NEXTAUTH_URL:**
```
https://your-actual-vercel-url.vercel.app
```
(Replace with your actual Vercel deployment URL)

### Step 4: Redeploy
After adding the environment variables:
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (1-2 minutes)

### Step 5: Test Login
After redeploy:
- **Email:** `admin@example.com`
- **Password:** `admin123456`

## Important Notes

- **No quotes:** Don't add quotes around the DATABASE_URL value
- **No spaces:** Make sure there are no extra spaces before or after
- **Copy exactly:** Copy the entire connection string exactly as shown
- **Redeploy required:** You MUST redeploy after adding environment variables for them to take effect

