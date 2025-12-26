# How to Set Environment Variables in Railway

## Step-by-Step Guide

### Step 1: Open Your Railway Project

1. Go to: https://railway.app
2. Log in to your account
3. Click on your project (the one with your Next.js app)

### Step 2: Select Your Service

You'll see two services:
- **PostgreSQL** (the database)
- **Your App Name** (the Next.js app)

**Click on the Next.js app service** (not the PostgreSQL one)

### Step 3: Open Variables Tab

1. At the top of the service page, you'll see tabs:
   - **Deployments**
   - **Variables** ← Click this one
   - **Settings**
   - **Metrics**
   - etc.

2. Click on **"Variables"** tab

### Step 4: Add Environment Variables

You'll see a section that says **"Variables"** with a button **"+ New Variable"**

Click **"+ New Variable"** for each variable:

#### Variable 1: DATABASE_URL

1. Click **"+ New Variable"**
2. In the popup:
   - **Name:** Type `DATABASE_URL`
   - **Value:** You need to get this from your PostgreSQL service
3. To get the DATABASE_URL:
   - Go back to your project (click the project name at top)
   - Click on the **PostgreSQL** service
   - Click **"Variables"** tab
   - Find `DATABASE_URL` 
   - Click the **eye icon** or **copy icon** to see/copy it
   - Copy the entire value
4. Go back to your Next.js app service → Variables
5. Paste the DATABASE_URL value
6. Click **"Add"** or **"Save"**

#### Variable 2: NEXTAUTH_SECRET

1. Click **"+ New Variable"**
2. **Name:** `NEXTAUTH_SECRET`
3. **Value:** `S3hZosW4BZjY8FR22NcEFTsT+9GkwhrPNc5BrozXDhk=`
4. Click **"Add"**

#### Variable 3: NEXTAUTH_URL

1. First, get your Railway app URL:
   - Go to your Next.js app service
   - Click **"Settings"** tab
   - Look for **"Domains"** section
   - You'll see a URL like: `your-app-name.up.railway.app`
   - Copy this URL
2. Go back to **"Variables"** tab
3. Click **"+ New Variable"**
4. **Name:** `NEXTAUTH_URL`
5. **Value:** `https://your-app-name.up.railway.app`
   - Replace `your-app-name` with your actual Railway domain
   - Make sure it starts with `https://`
6. Click **"Add"**

### Step 5: Verify Variables

After adding all three, you should see:
- ✅ `DATABASE_URL` = `postgresql://...`
- ✅ `NEXTAUTH_SECRET` = `S3hZosW4BZjY8FR22NcEFTsT+9GkwhrPNc5BrozXDhk=`
- ✅ `NEXTAUTH_URL` = `https://your-app-name.up.railway.app`

### Step 6: Redeploy (If Needed)

Railway will automatically redeploy when you add variables, but if it doesn't:
1. Go to **"Deployments"** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**

## Visual Guide

```
Railway Dashboard
├── Your Project
    ├── PostgreSQL Service
    │   └── Variables tab → Copy DATABASE_URL
    │
    └── Your App Service
        ├── Variables tab ← Add variables here
        │   ├── + New Variable
        │   │   ├── Name: DATABASE_URL
        │   │   └── Value: (paste from PostgreSQL)
        │   │
        │   ├── + New Variable
        │   │   ├── Name: NEXTAUTH_SECRET
        │   │   └── Value: S3hZosW4BZjY8FR22NcEFTsT+9GkwhrPNc5BrozXDhk=
        │   │
        │   └── + New Variable
        │       ├── Name: NEXTAUTH_URL
        │       └── Value: https://your-app-name.up.railway.app
        │
        └── Settings tab → Get your domain URL
```

## Tips

- **No quotes needed:** Don't add quotes around the values
- **No spaces:** Make sure there are no extra spaces
- **Case sensitive:** Variable names are case-sensitive (`DATABASE_URL` not `database_url`)
- **Auto-redeploy:** Railway usually redeploys automatically when you add variables

## Troubleshooting

**Can't find Variables tab?**
- Make sure you clicked on the **Next.js app service**, not the PostgreSQL service

**Can't find DATABASE_URL in PostgreSQL?**
- Click on PostgreSQL service → Variables tab
- It should be there automatically
- If not, Railway might use a different name - check all variables

**Variables not working?**
- Make sure you redeployed after adding variables
- Check that variable names are exactly: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

