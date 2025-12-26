# Railway Initial Setup - From Scratch

## Step 1: Sign Up / Log In to Railway

1. Go to: https://railway.app
2. Click "Start a New Project" or "Log In"
3. Sign up with GitHub (easiest - one click)

## Step 2: Create New Project

1. After logging in, you'll see the Railway dashboard
2. Click the **"+ New Project"** button (usually at the top right or center)
3. You'll see options:
   - **"Deploy from GitHub repo"** ← Choose this one
   - "Empty Project"
   - "Deploy a Template"

## Step 3: Connect GitHub Repository

1. Click **"Deploy from GitHub repo"**
2. Railway will ask for GitHub permissions (click "Authorize")
3. You'll see a list of your GitHub repositories
4. Find and select: **`soccer-data-cursor101`** (or `HLA10/soccer-data-cursor101`)
5. Click on it to select it

## Step 4: Railway Auto-Detects Next.js

Railway will automatically:
- Detect it's a Next.js project
- Start deploying
- Create a service for your app

**Wait for the first deployment to start** (you'll see it building)

## Step 5: Add PostgreSQL Database

While the app is deploying:

1. In your Railway project, click **"+ New"** button
2. Select **"Database"**
3. Select **"PostgreSQL"**
4. Railway will create a PostgreSQL database automatically
5. It will show up as a second service in your project

## Step 6: Get Your App URL

1. Click on your **Next.js app service** (the one that's deploying)
2. Click **"Settings"** tab
3. Scroll down to **"Domains"** section
4. Click **"Generate Domain"** if you don't see a URL
5. Copy the URL (it will be like: `your-app-name.up.railway.app`)

## Step 7: Set Environment Variables

Now follow the guide in `RAILWAY_SET_ENV_VARIABLES.md` to add:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL

## What You Should See

After setup, your Railway project should show:

```
Your Project Name
├── your-app-name (Next.js service)
│   ├── Deployments tab
│   ├── Variables tab ← Add env vars here
│   └── Settings tab ← Get your URL here
│
└── PostgreSQL (Database service)
    ├── Variables tab ← Get DATABASE_URL here
    └── Data tab
```

## Troubleshooting

**Don't see "New Project" button?**
- Make sure you're logged in
- Try refreshing the page
- Check if you're on the dashboard (not a specific project)

**Can't find your GitHub repo?**
- Make sure you authorized Railway to access your GitHub
- Check that the repo is public or you've given Railway access
- Try disconnecting and reconnecting GitHub

**App not deploying?**
- Check the "Deployments" tab for errors
- Make sure your GitHub repo has the latest code
- Check Railway logs for build errors

