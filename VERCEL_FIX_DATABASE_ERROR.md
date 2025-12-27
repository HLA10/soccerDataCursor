# Fix: Database Connection Error on Vercel

## The Error
"Database connection error. Please ensure the database is properly configured."

## Root Cause
Vercel cannot connect to your Neon database. This is usually because:
1. DATABASE_URL is not set in Vercel
2. DATABASE_URL is set incorrectly
3. SSL mode is not properly configured

## Solution: Set Environment Variables in Vercel

Go to: https://vercel.com/huffmans-projects-53a3c96a/soccer-data-cursor101-scwv/settings/environment-variables

### 1. DATABASE_URL (CRITICAL - This is likely missing!)

**Key:** `DATABASE_URL`

**Value:** 
```
postgresql://neondb_owner:npg_7OoNATjp0zaX@ep-jolly-hall-ag2bwqco-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Environment:** 
- ✅ Production
- ✅ Preview (optional but recommended)

**Important:** 
- Copy the ENTIRE connection string above
- Make sure `?sslmode=require&channel_binding=require` is at the end
- No spaces or line breaks

### 2. NEXTAUTH_SECRET

**Key:** `NEXTAUTH_SECRET`

**Value:**
```
S3hZosW4BZjY8FR22NcEFTsT+9GkwhrPNc5BrozXDhk=
```

**Environment:**
- ✅ Production
- ✅ Preview

### 3. NEXTAUTH_URL

**Key:** `NEXTAUTH_URL`

**Value:**
```
https://soccer-data-cursor101-scwv-61695178b-huffmans-projects-53a3c96a.vercel.app
```

**Environment:**
- ✅ Production
- ✅ Preview

**Important:**
- Must start with `https://`
- No trailing slash
- Use your exact Vercel domain

## Step-by-Step Instructions

1. **Go to Environment Variables:**
   - https://vercel.com/huffmans-projects-53a3c96a/soccer-data-cursor101-scwv/settings/environment-variables

2. **For each variable above:**
   - Click "Add New" (or "Edit" if it already exists)
   - Enter the Key
   - Paste the Value (be careful with DATABASE_URL - copy the entire string)
   - Select "Production" environment (and "Preview" if you want)
   - Click "Save"

3. **After adding all 3 variables:**
   - Vercel will automatically redeploy
   - Wait for deployment to complete (check the deployment page)

4. **Test login:**
   - Go to: https://soccer-data-cursor101-scwv-61695178b-huffmans-projects-53a3c96a.vercel.app/login
   - Email: `admin@example.com`
   - Password: `admin123456`

## Verify Variables Are Set

After adding, you should see all 3 variables listed:
- ✅ DATABASE_URL
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL

## Common Mistakes

❌ **Wrong:** DATABASE_URL without `?sslmode=require`
✅ **Correct:** DATABASE_URL with `?sslmode=require&channel_binding=require`

❌ **Wrong:** NEXTAUTH_URL with `http://` instead of `https://`
✅ **Correct:** NEXTAUTH_URL with `https://`

❌ **Wrong:** NEXTAUTH_URL with trailing slash
✅ **Correct:** NEXTAUTH_URL without trailing slash

❌ **Wrong:** Setting variables only for "Development"
✅ **Correct:** Set for "Production" (and "Preview")

## Still Not Working?

If you still get database errors after setting all variables:

1. **Check Deployment Logs:**
   - Go to your deployment page
   - Click "Runtime Logs" tab
   - Look for database connection errors

2. **Verify Neon Database:**
   - Make sure your Neon database is running
   - Check Neon dashboard for any issues

3. **Test Connection:**
   - The connection string works locally, so it should work on Vercel
   - Double-check you copied the ENTIRE connection string

4. **Redeploy:**
   - After setting variables, make sure Vercel redeployed
   - If not, manually trigger a redeploy


