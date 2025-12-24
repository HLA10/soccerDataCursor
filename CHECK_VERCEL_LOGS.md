# How to Check Vercel Runtime Logs

## The Problem
You're getting "Database connection error" even though the build succeeded. This means the environment variables aren't being read at runtime.

## Check Runtime Logs

1. **Go to your deployment page:**
   https://vercel.com/huffmans-projects-53a3c96a/soccer-data-cursor101-scwv

2. **Click on the latest deployment**

3. **Click "Runtime Logs" tab**

4. **Look for errors like:**
   - "Can't reach database server"
   - "Environment variable not found: DATABASE_URL"
   - "Invalid connection string"
   - Prisma connection errors

## Common Issues Found in Logs

### Issue 1: "Environment variable not found"
**Fix:** DATABASE_URL is not set in Vercel environment variables

### Issue 2: "Invalid connection string"
**Fix:** DATABASE_URL has quotes or extra characters

### Issue 3: "Can't reach database server"
**Fix:** Connection string is wrong or Neon database is down

## Verify Environment Variables Are Set

1. Go to: https://vercel.com/huffmans-projects-53a3c96a/soccer-data-cursor101-scwv/settings/environment-variables

2. **Check that you see all 3 variables:**
   - ✅ DATABASE_URL
   - ✅ NEXTAUTH_SECRET
   - ✅ NEXTAUTH_URL

3. **For each variable, verify:**
   - It's set for **Production** environment
   - The value is correct (no quotes, no spaces)
   - It was saved successfully

## Double-Check DATABASE_URL Format

The value should be EXACTLY this (no quotes):
```
postgresql://neondb_owner:npg_7OoNATjp0zaX@ep-jolly-hall-ag2bwqco-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Common mistakes:**
- ❌ `"postgresql://..."` (with quotes)
- ❌ ` postgresql://...` (with leading space)
- ✅ `postgresql://...` (correct - no quotes, no spaces)

## After Fixing

1. Save the environment variable
2. Wait for Vercel to redeploy
3. Check Runtime Logs again - errors should be gone
4. Try logging in

