# Vercel New Project Setup Guide

## Step 1: Framework Selection

**Select: `Next.js`**

Vercel should auto-detect it, but if it asks:
- **Framework Preset:** Next.js
- **Root Directory:** `.` (leave as default)
- **Build Command:** `npm run build` (should auto-detect)
- **Output Directory:** `.next` (should auto-detect)
- **Install Command:** `npm install` (should auto-detect)

## Step 2: After Deployment

**CRITICAL:** You MUST add environment variables after the first deployment!

### Go to: Project → Settings → Environment Variables

Add these 3 variables:

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_3OEzI4MpaCTy@ep-orange-wildflower-agvaohm3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Important:**
- Copy EXACTLY as shown (no extra spaces or quotes)
- Make sure it includes `?sslmode=require&channel_binding=require` at the end

### 2. NEXTAUTH_SECRET
```
S3hZosW4BZjY8FR22NcEFTsT+9GkwhrPNc5BrozXDhk=
```

**Or generate a new one:**
```bash
openssl rand -base64 32
```

### 3. NEXTAUTH_URL
```
https://[your-vercel-url].vercel.app
```

**Important:**
- Replace `[your-vercel-url]` with your actual Vercel URL
- Must start with `https://`
- Must match your deployment URL exactly

## Step 3: Redeploy After Adding Variables

After adding environment variables:
1. Go to: Deployments tab
2. Click the "..." menu on the latest deployment
3. Click "Redeploy"
4. This will trigger a new build with the environment variables

## Step 4: Verify Login

After redeploy:
1. Go to your Vercel URL
2. Try logging in:
   - Email: `admin@example.com`
   - Password: `admin123456`

## Troubleshooting

**If login still doesn't work:**
1. Check Runtime Logs (not Build Logs)
2. Verify all 3 environment variables are set correctly
3. Make sure you redeployed after adding variables
4. Check that DATABASE_URL has no extra quotes or spaces

