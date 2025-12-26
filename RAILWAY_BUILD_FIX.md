# Fix Railway Build Failures

## How to See Build Errors

1. In Railway, click on your **app service**
2. Click **"Deployments"** tab
3. Click on the **failed deployment** (usually the latest one)
4. Scroll down to see the **build logs**
5. Look for error messages (usually in red or marked with ❌)

## Common Build Errors and Fixes

### Error 1: TypeScript Errors

**Error looks like:**
```
Type error: Property 'X' does not exist on type 'Y'
```

**Fix:**
- Usually means Prisma Client needs regeneration
- Or there's a type mismatch in the code
- Share the error and I'll fix it

### Error 2: Prisma Client Not Generated

**Error looks like:**
```
Module not found: Can't resolve '@prisma/client'
```

**Fix:**
- Make sure `package.json` has `postinstall: "prisma generate"`
- Railway should run this automatically
- If not, we may need to add it

### Error 3: Security Vulnerability

**Error looks like:**
```
Security vulnerabilities detected
next@14.2.18
```

**Fix:**
- We already fixed this (upgraded to 14.2.35)
- Make sure the latest code is pushed to GitHub

### Error 4: Missing Dependencies

**Error looks like:**
```
Cannot find module 'X'
```

**Fix:**
- Add missing package to `package.json`
- Or run `npm install` locally and commit `package-lock.json`

### Error 5: Database Connection During Build

**Error looks like:**
```
Error: Can't reach database server
```

**Fix:**
- This shouldn't happen during build
- Make sure `export const dynamic = 'force-dynamic'` is on dynamic routes
- We already added this to most routes

## Quick Fixes to Try

### Fix 1: Verify package.json

Make sure `package.json` has:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Fix 2: Check Railway Build Settings

1. Go to your app service → **Settings**
2. Look for **"Build Command"**
3. Should be: `npm run build` (or auto-detected)
4. Look for **"Start Command"**
5. Should be: `npm start` (or auto-detected)

### Fix 3: Check Node Version

Railway should auto-detect Node.js version, but you can set it:
1. Go to Settings
2. Look for **"Node Version"** or **".nvmrc"**
3. Should be Node 18 or 20

## What to Share

When asking for help, share:
1. **The exact error message** from Railway build logs
2. **Which step failed** (Installing dependencies? Building? Type checking?)
3. **Any red error lines** from the logs

## Most Likely Issue

Based on our recent changes, the most likely issue is:
- **TypeScript errors** because Prisma Client hasn't been regenerated with new models
- **Missing models** in the database (migrations not run)

Let me know what error you see and I'll fix it!

