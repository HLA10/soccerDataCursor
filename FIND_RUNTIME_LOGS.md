# How to Find Vercel Runtime Logs

## Quick Steps

1. **Go to your Vercel project:**
   - https://vercel.com/huffmans-projects-53a3c96a/soccer-data-cursor101-scwv

2. **Click on the latest deployment:**
   - Look for the deployment that shows "Ready" status
   - Usually the first one in the list
   - Click anywhere on that deployment row

3. **Find the "Runtime Logs" tab:**
   - At the top of the deployment page, you'll see tabs:
     - Overview
     - **Build Logs** (this shows deployment/build info)
     - **Runtime Logs** ← **THIS IS WHAT WE NEED!**
     - Functions
     - Source
     - etc.

4. **Click "Runtime Logs" tab**

5. **Keep it open and try logging in:**
   - Open your app in another tab: https://soccer-data-cursor101-scwv-4ebl8qetk-huffmans-projects-53a3c96a.vercel.app/login
   - Try to log in
   - Go back to Runtime Logs tab
   - You'll see logs appearing in real-time!

## What You'll See

The Runtime Logs will show:
- `🔐 Authorize called`
- `🔍 Looking up user in database`
- `✅ User found` or `❌ User not found`
- `🔐 Verifying password...`
- `✅ VALID` or `❌ INVALID`
- Error messages with details

## Alternative: Function Logs

If you don't see "Runtime Logs" tab:
1. Click "Functions" tab instead
2. Find `/api/auth/[...nextauth]` in the list
3. Click on it to see logs for that specific function

## Screenshot Guide

The page should look like this:
```
┌─────────────────────────────────────────┐
│  Deployment: soccer-data-cursor101...   │
├─────────────────────────────────────────┤
│ [Overview] [Build Logs] [Runtime Logs]  │ ← Tabs here
│                    ↑                     │
│              Click this!                 │
└─────────────────────────────────────────┘
```

## Still Can't Find It?

If you can't find Runtime Logs:
1. Make sure you're on the **deployment page** (not the project overview)
2. Look for "Logs" or "Function Logs" as alternatives
3. Check if you need to scroll horizontally to see more tabs

