# Troubleshooting Vercel Login: Invalid Email or Password

## Quick Checklist

### 1. Verify Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Make sure these 3 are set for **Production**:

**DATABASE_URL:**
```
postgresql://neondb_owner:npg_3OEzI4MpaCTy@ep-orange-wildflower-agvaohm3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
(Replace with your actual Neon database URL)

**NEXTAUTH_SECRET:**
```
S3hZosW4BZjY8FR22NcEFTsT+9GkwhrPNc5BrozXDhk=
```

**NEXTAUTH_URL:**
```
https://your-actual-vercel-url.vercel.app
```
(Must match your exact Vercel deployment URL)

### 2. Verify Admin User Exists

The admin user should exist with:
- **Email:** `admin@example.com`
- **Password:** `admin123456`
- **Role:** `ADMIN`
- **Status:** `ACTIVE`

### 3. Reset Admin Password (If Needed)

If the password isn't working, reset it:

1. Get your DATABASE_URL from Vercel
2. Run this script locally:

```powershell
cd C:\Projects\SoccerDataCursor
$env:DATABASE_URL="your-database-url-from-vercel"
node scripts/reset-admin-sql.js
```

### 4. Check Runtime Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments** → Latest deployment
4. Click **Runtime Logs** (or **Functions** → **View Logs**)
5. Try logging in again
6. Watch the logs for:
   - `🔐 Authorize called`
   - `🔍 Looking up user in database`
   - `✅ User found` or `❌ User not found`
   - `🔐 Verifying password`
   - `✅ VALID` or `❌ INVALID`

### 5. Common Issues

**Issue: DATABASE_URL not set**
- **Symptom:** "Database connection error"
- **Fix:** Add DATABASE_URL to Vercel environment variables

**Issue: Wrong DATABASE_URL**
- **Symptom:** User not found, or database errors
- **Fix:** Make sure DATABASE_URL points to the correct Neon database

**Issue: Admin user doesn't exist**
- **Symptom:** "User not found in database"
- **Fix:** Run the reset-admin-sql.js script to create/reset the admin user

**Issue: Password hash mismatch**
- **Symptom:** "Password verification failed"
- **Fix:** Reset the password using reset-admin-sql.js script

**Issue: Environment variables not applied**
- **Symptom:** Old values still being used
- **Fix:** Redeploy after adding/changing environment variables

## Quick Fix Script

If you have your DATABASE_URL, I can run the reset script for you. Just share the DATABASE_URL from Vercel.

