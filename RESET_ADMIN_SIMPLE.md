# Simple Guide: Reset Admin Password

## Option 1: I'll Run It For You (Easiest!)

Just provide me with your `DATABASE_URL` from Vercel, and I'll run the script for you!

**To get DATABASE_URL:**
1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to: **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. Copy the entire value
6. Share it with me

## Option 2: Run It Yourself

### Step 1: Open PowerShell in Project Folder

**Method A: From File Explorer**
1. Open File Explorer
2. Navigate to: `C:\Projects\SoccerDataCursor`
3. Click in the address bar and type: `powershell`
4. Press Enter

**Method B: From Start Menu**
1. Press `Windows Key + X`
2. Select "Windows PowerShell" or "Terminal"
3. Type: `cd C:\Projects\SoccerDataCursor`
4. Press Enter

**Method C: Right-Click**
1. In File Explorer, navigate to `C:\Projects\SoccerDataCursor`
2. Right-click in the folder (not on a file)
3. Select "Open in Terminal" or "Open PowerShell window here"

### Step 2: Get DATABASE_URL from Vercel

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to: **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. Copy the entire value

### Step 3: Run These Commands

In PowerShell, type (replace with your actual DATABASE_URL):

```powershell
$env:DATABASE_URL="postgresql://neondb_owner:npg_3OEzI4MpaCTy@ep-orange-wildflower-agvaohm3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
node scripts/reset-admin-production.js
```

## Option 3: Use Vercel CLI (If Installed)

If you have Vercel CLI installed:

```powershell
vercel env pull .env.production
node scripts/reset-admin-production.js
```

## After Running

Try logging in:
- **Email:** `admin@example.com`
- **Password:** `admin123456`


