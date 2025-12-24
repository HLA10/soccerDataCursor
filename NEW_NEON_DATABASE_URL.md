# New Neon Database Connection String

## For Vercel Environment Variables

**Key:** `DATABASE_URL`

**Value:**
```
postgresql://neondb_owner:npg_3OEzI4MpaCTy@ep-orange-wildflower-agvaohm3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Steps to Update Vercel

1. **Go to Environment Variables:**
   https://vercel.com/huffmans-projects-53a3c96a/soccer-data-cursor101-scwv/settings/environment-variables

2. **Find DATABASE_URL:**
   - Click **Edit** on `DATABASE_URL`

3. **Update the value:**
   - Delete the old value
   - Paste the new connection string above
   - **NO QUOTES, NO SPACES**
   - Must start with `postgresql://`

4. **Save:**
   - Click **Save**
   - Vercel will automatically redeploy

5. **Wait for deployment:**
   - Check deployment status
   - Wait for "Ready" status

6. **Test login:**
   - Email: `admin@example.com`
   - Password: `admin123456`

## What Was Done

✅ All Prisma migrations applied
✅ Admin user created
✅ Database schema is clean and complete
✅ Ready for production use

