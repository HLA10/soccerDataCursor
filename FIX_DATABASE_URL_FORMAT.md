# Fix: DATABASE_URL Format Error

## The Error
```
Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
```

## The Problem
The DATABASE_URL in Vercel has incorrect formatting (likely has quotes or extra characters).

## The Solution

### Step 1: Go to Environment Variables
https://vercel.com/huffmans-projects-53a3c96a/soccer-data-cursor101-scwv/settings/environment-variables

### Step 2: Edit DATABASE_URL

1. Find `DATABASE_URL` in the list
2. Click **Edit** (or delete and recreate)
3. **Delete the entire value**
4. **Paste this EXACT value** (copy the entire line below):

```
postgresql://neondb_owner:npg_7OoNATjp0zaX@ep-jolly-hall-ag2bwqco-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Step 3: Important Checks

❌ **WRONG - Don't do this:**
- `"postgresql://..."` (with quotes)
- `'postgresql://...'` (with single quotes)
- ` postgresql://...` (with leading space)
- Line breaks in the value

✅ **CORRECT - Do this:**
- `postgresql://...` (no quotes, no spaces)
- All on one line
- Starts with `postgresql://`

### Step 4: Save and Redeploy

1. Click **Save**
2. Vercel will automatically redeploy
3. Wait for deployment to complete
4. Check that the error is gone

## Verify It's Correct

After saving, the DATABASE_URL should look like this in Vercel:
```
postgresql://neondb_owner:npg_7OoNATjp0zaX@ep-jolly-hall-ag2bwqco-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

No quotes, no extra spaces, all one line.

## After Fix

Once the deployment completes without errors:
- Go to: https://soccer-data-cursor101-scwv-4ebl8qetk-huffmans-projects-53a3c96a.vercel.app/login
- Email: `admin@example.com`
- Password: `admin123456`

