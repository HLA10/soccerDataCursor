# Netlify Deployment Guide

## Quick Configuration Values

When setting up your site in Netlify dashboard, use these values:

### Base directory
```
.
```
(Leave empty or use `.` - this means root directory)

### Build command
```
npm run build
```

### Publish directory
```
.next
```

### Functions directory
```
.netlify/functions
```
(Or leave as default: `netlify/functions`)

## Step-by-Step Setup

### 1. Install Netlify Next.js Plugin

First, install the required plugin:
```bash
npm install --save-dev @netlify/plugin-nextjs
```

### 2. Connect Your Repository

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository: `HLA10/soccerDataCursor`

### 3. Configure Build Settings

Netlify should auto-detect Next.js, but if you need to set manually:

- **Base directory:** `.` (or leave empty)
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Functions directory:** `.netlify/functions` (or `netlify/functions`)

### 4. Add Environment Variables

Go to: **Site settings → Environment variables**

Add these **3 required variables**:

#### DATABASE_URL
```
postgresql://username:password@host:port/database?schema=public
```
Replace with your actual PostgreSQL connection string.

#### NEXTAUTH_SECRET
Generate a secret key:
```bash
openssl rand -base64 32
```
Or use this example:
```
S3hZosW4BZjY8FR22NcEFTsT+9GkwhrPNc5BrozXDhk=
```

#### NEXTAUTH_URL
```
https://your-site-name.netlify.app
```
Replace `your-site-name` with your actual Netlify site URL.

**Important:** 
- Set NEXTAUTH_URL **after** your first deployment (you'll get the URL then)
- Must start with `https://`
- No trailing slash

### 5. Deploy

1. Click "Deploy site"
2. Wait for the build to complete
3. After deployment, update NEXTAUTH_URL with your actual site URL
4. Go to **Deployments** → Click "..." on latest deployment → **Redeploy**

### 6. Verify Deployment

After redeploy:
1. Visit your Netlify URL
2. Try logging in:
   - Email: `admin@example.com`
   - Password: `admin123`

## Troubleshooting

### Build Fails

**Error: "Cannot find module '@netlify/plugin-nextjs'"**
- Solution: Make sure you ran `npm install --save-dev @netlify/plugin-nextjs` and committed `package.json`

**Error: "Prisma Client not generated"**
- Solution: The `postinstall` script should run automatically. Check build logs to verify.

**Error: "Database connection failed"**
- Solution: Make sure DATABASE_URL is set correctly in environment variables

### Login Doesn't Work

1. Check that all 3 environment variables are set
2. Verify NEXTAUTH_URL matches your site URL exactly
3. Make sure you redeployed after adding environment variables
4. Check Netlify function logs for errors

### View Logs

1. Go to **Site overview** → **Functions** tab
2. Click on a function to see logs
3. Or go to **Deployments** → Click on a deployment → **View build log**

## Alternative: Manual Configuration (Without Plugin)

If you prefer not to use the plugin, you can configure manually:

**Base directory:** `.`
**Build command:** `npm run build`
**Publish directory:** `.next`
**Functions directory:** `netlify/functions`

But the plugin is recommended for better Next.js support.
