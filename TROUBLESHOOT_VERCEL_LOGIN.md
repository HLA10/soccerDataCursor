# Troubleshooting Vercel Login Issues

## Current Status
- ✅ Build succeeds
- ✅ Environment variables are set
- ❌ Login password not recognized

## Possible Causes

### 1. DATABASE_URL Not Connecting to Neon
**Symptom:** "Database connection error" or password not working

**Check:**
- Go to Vercel → Runtime Logs
- Look for Prisma connection errors
- Check if DATABASE_URL is being read

**Fix:**
- Verify DATABASE_URL in Vercel has NO quotes
- Make sure it's set for Production environment
- Format: `postgresql://...?sslmode=require&channel_binding=require`

### 2. Admin User Doesn't Exist in Neon
**Symptom:** Password not recognized, but no connection error

**Check:**
- Admin user should exist in Neon database
- Email: `admin@example.com`

**Fix:**
- I've just recreated the admin user in Neon
- Password: `admin123456`

### 3. Wrong Database Being Used
**Symptom:** Works locally but not on Vercel

**Check:**
- Vercel might be using a different DATABASE_URL
- Check Runtime Logs for which database it's connecting to

**Fix:**
- Make sure Vercel DATABASE_URL points to Neon (not localhost)
- Should be: `postgresql://neondb_owner:...@ep-jolly-hall-ag2bwqco-pooler...`

### 4. Environment Variables Not Loading
**Symptom:** Build works but runtime fails

**Check:**
- Runtime Logs for "Environment variable not found"
- Verify variables are set for Production (not just Preview)

**Fix:**
- Set all 3 variables for Production environment
- Redeploy after setting

## Step-by-Step Debugging

### Step 1: Check Runtime Logs
1. Go to Vercel deployment page
2. Click "Runtime Logs" tab
3. Try logging in
4. Watch for errors in real-time

### Step 2: Verify Environment Variables
1. Go to Settings → Environment Variables
2. Check all 3 are set:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
3. Make sure they're for Production

### Step 3: Test Connection
The admin user has been recreated in Neon with password `admin123456`.

### Step 4: Clear Browser Cache
Sometimes old session data causes issues:
- Clear browser cache
- Clear cookies for the Vercel domain
- Try incognito/private window

## Current Admin Credentials

- **Email:** `admin@example.com`
- **Password:** `admin123456`
- **Status:** ACTIVE
- **Role:** ADMIN

## Next Steps

1. **Check Runtime Logs** - This will show the actual error
2. **Verify DATABASE_URL** - Make sure it's correct format
3. **Try logging in again** - After verifying above
4. **Share the Runtime Log error** - If still not working

## Common Runtime Log Errors

**"Can't reach database server"**
→ DATABASE_URL is wrong or Neon is down

**"Environment variable not found"**
→ DATABASE_URL not set in Vercel

**"Invalid connection string"**
→ DATABASE_URL has quotes or wrong format

**"User not found"**
→ Admin user doesn't exist (should be fixed now)

**"Password verification failed"**
→ Password hash mismatch (should be fixed now)

