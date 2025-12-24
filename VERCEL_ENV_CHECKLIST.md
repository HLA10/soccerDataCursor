# Vercel Environment Variables Checklist

## Required Environment Variables for Production

Your Vercel deployment needs these environment variables set:

### 1. DATABASE_URL ✅ (You have this)
```
postgresql://neondb_owner:npg_7OoNATjp0zaX@ep-jolly-hall-ag2bwqco-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. NEXTAUTH_SECRET ⚠️ (CRITICAL - Check this!)
- **What it is:** A secret key for encrypting NextAuth sessions
- **How to generate:** Run: `openssl rand -base64 32`
- **Where to set:** Vercel Dashboard → Settings → Environment Variables
- **Must be:** A random string, 32+ characters
- **Environment:** Production (and Preview)

### 3. NEXTAUTH_URL ⚠️ (CRITICAL - Check this!)
- **What it is:** Your production domain URL
- **Format:** `https://your-project.vercel.app` (NO trailing slash)
- **Where to set:** Vercel Dashboard → Settings → Environment Variables
- **Environment:** Production (and Preview)
- **Important:** Must match your actual Vercel URL exactly

## How to Check/Set in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project

2. **Navigate to Environment Variables:**
   - Click **Settings** (top menu)
   - Click **Environment Variables** (left sidebar)

3. **Check/Add each variable:**
   - Look for `DATABASE_URL` - should be set ✅
   - Look for `NEXTAUTH_SECRET` - **MUST BE SET** ⚠️
   - Look for `NEXTAUTH_URL` - **MUST BE SET** ⚠️

4. **For each missing variable:**
   - Click **"Add New"**
   - Enter the Key
   - Enter the Value
   - Select **Production** (and **Preview** if you want)
   - Click **Save**

5. **After adding/updating:**
   - Vercel will auto-redeploy, OR
   - Go to **Deployments** → Click **"..."** → **Redeploy**

## Generate NEXTAUTH_SECRET

If you need to generate a new secret, run this in PowerShell:

```powershell
# Option 1: Using OpenSSL (if installed)
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Common Issues

### "CredentialsSignin" Error
- **Cause:** NEXTAUTH_SECRET missing or incorrect
- **Fix:** Set NEXTAUTH_SECRET in Vercel

### "Invalid callback URL"
- **Cause:** NEXTAUTH_URL doesn't match your Vercel URL
- **Fix:** Set NEXTAUTH_URL to your exact Vercel domain

### "Database connection failed"
- **Cause:** DATABASE_URL missing or incorrect
- **Fix:** Verify DATABASE_URL is set correctly

## Quick Test

After setting all variables and redeploying:
1. Go to your Vercel URL
2. Try logging in with:
   - Email: `admin@example.com`
   - Password: `admin123456`

If it still doesn't work, check:
- Browser console (F12) for errors
- Vercel deployment logs
- Make sure all 3 variables are set for **Production** environment

