# Debug Vercel Login Issue

## Step 1: Check Runtime Logs

The runtime logs will show exactly what's happening during login.

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Click on the latest deployment
5. Click on **"Runtime Logs"** tab (or **"Functions"** → **"View Logs"**)
6. Try logging in again
7. Watch the logs in real-time

Look for:
- `🔐 Authorize called` - Shows the login attempt started
- `🔍 Looking up user in database` - Shows database query
- `✅ User found` or `❌ User not found` - Shows if user exists
- `🔐 Verifying password` - Shows password check
- `✅ VALID` or `❌ INVALID` - Shows password result
- Any error messages

## Step 2: Verify Environment Variables

Make sure all 3 are set:

1. Go to: **Settings** → **Environment Variables**
2. Verify you see:
   - `DATABASE_URL` ✅
   - `NEXTAUTH_SECRET` ✅
   - `NEXTAUTH_URL` ✅

3. Check that they're set for **Production** environment

## Step 3: Verify You Redeployed

After adding environment variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Check the latest deployment timestamp
3. If it's before you added the variables, you need to redeploy:
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

## Step 4: Check What Error You See

When you try to login, what happens?
- Does it show "Invalid email or password"?
- Does it redirect back to login?
- Does it show any error message?
- Does it just not respond?

## Step 5: Verify Admin User Exists

The admin user should exist with:
- Email: `admin@example.com`
- Password: `admin123456`

We reset this earlier, but let's verify it's still there.

