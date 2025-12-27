# Setup New Neon Database - Fresh Start

## Step 1: Create New Neon Database

1. **Go to Neon Console:**
   - https://console.neon.tech
   - Sign in

2. **Create New Project:**
   - Click "Create Project" or "+ New Project"
   - Name: `football-cms-production` (or any name you like)
   - Region: Choose closest to you (or EU Central if you're in Europe)
   - PostgreSQL version: Latest (15 or 16)
   - Click "Create Project"

3. **Get Connection String:**
   - After creation, you'll see "Connection Details"
   - Copy the connection string
   - It looks like: `postgres://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname`
   - **IMPORTANT:** Make sure to get the connection string, NOT the connection pooling string (unless you want pooling)

## Step 2: Run Migrations on New Database

Once you have the new connection string, I'll help you:
1. Run all Prisma migrations
2. Create the admin user
3. Update Vercel DATABASE_URL

## Step 3: Update Vercel

After setup, update DATABASE_URL in Vercel to point to the new database.

## Benefits of Fresh Start

✅ Clean schema (no missing columns)
✅ All migrations applied in order
✅ No leftover inconsistencies
✅ Fresh admin user with known password

## Ready?

Once you create the new Neon project and have the connection string, share it with me and I'll:
1. Run migrations
2. Create admin user
3. Verify everything works
4. Help you update Vercel


