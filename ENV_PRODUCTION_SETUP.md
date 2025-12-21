# Production Environment Variables Setup

This guide helps you configure environment variables for production deployment.

## Required Environment Variables

### 1. NEXTAUTH_SECRET

**Purpose:** Secret key for NextAuth.js authentication encryption

**Requirements:**
- Must be at least 32 characters
- Should be a strong random string
- Never commit this to version control

**Generate a new secret:**

**Option A: Using OpenSSL (recommended)**
```bash
openssl rand -base64 32
```

**Option B: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option C: Using PowerShell (Windows)**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example:**
```
NEXTAUTH_SECRET="0+PD65OMwgYUXSrP0Nxg57oD/vkp4qSriYi1njy10wI="
```

---

### 2. NEXTAUTH_URL

**Purpose:** The canonical URL of your site (used for OAuth callbacks)

**Requirements:**
- Must match your production domain exactly
- Must use `https://` in production (not `http://`)
- No trailing slash

**Development:**
```
NEXTAUTH_URL="http://localhost:3000"
```

**Production:**
```
NEXTAUTH_URL="https://yourdomain.com"
```

**Important:** Update this after your first deployment to match your actual domain.

---

### 3. DATABASE_URL

**Purpose:** PostgreSQL database connection string

**Requirements:**
- Must include `?sslmode=require` for production (enforces SSL encryption)
- Never commit credentials to version control

**Development (local):**
```
DATABASE_URL="postgresql://username:password@localhost:5432/football_cms?schema=public"
```

**Production (with SSL):**
```
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public&sslmode=require"
```

**Breaking down the connection string:**
- `postgresql://` - Protocol
- `username:password` - Database credentials
- `@host:5432` - Database server and port
- `/database` - Database name
- `?schema=public` - Schema name
- `&sslmode=require` - **Required for production** (enforces SSL)

---

## Optional Environment Variables

### RESEND_API_KEY
For sending invitation emails and notifications.

```
RESEND_API_KEY="re_xxxxxxxxxxxxx"
```

### OPENAI_API_KEY
For AI-generated match reports (optional feature).

```
OPENAI_API_KEY="sk-xxxxxxxxxxxxx"
```

---

## Setup Script

Run the setup script to check and fix your environment variables:

```bash
node scripts/setup-env-production.js
```

This script will:
- ✅ Check if NEXTAUTH_SECRET is strong enough (32+ chars)
- ✅ Generate a new secret if needed
- ✅ Verify DATABASE_URL has SSL mode
- ✅ Check NEXTAUTH_URL format
- ✅ Update .env file with fixes

---

## Production Deployment Checklist

Before deploying to production:

- [ ] **NEXTAUTH_SECRET** is set and is 32+ characters
- [ ] **NEXTAUTH_URL** matches your production domain exactly (https://yourdomain.com)
- [ ] **DATABASE_URL** includes `?sslmode=require` for SSL encryption
- [ ] All environment variables are set in your hosting platform (Vercel, etc.)
- [ ] `.env` file is in `.gitignore` (never commit secrets)
- [ ] Production secrets are different from development secrets

---

## Setting Environment Variables in Hosting Platforms

### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `DATABASE_URL`
4. Select environment (Production, Preview, Development)
5. Redeploy after adding variables

### Other Platforms
- **Railway:** Project Settings → Variables
- **Render:** Environment → Environment Variables
- **Heroku:** Settings → Config Vars
- **DigitalOcean:** App Settings → Environment Variables

---

## Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use different secrets** for development and production
3. **Rotate secrets** if they're ever exposed
4. **Use SSL** for all database connections in production
5. **Limit access** to environment variables (only admins)

---

## Troubleshooting

### "NEXTAUTH_SECRET is not set"
- Generate a new secret using one of the methods above
- Add it to your `.env` file and hosting platform

### "Invalid NEXTAUTH_URL"
- Ensure it matches your domain exactly
- Use `https://` in production
- No trailing slash

### "Database connection failed"
- Check DATABASE_URL format
- Verify SSL mode is set: `?sslmode=require`
- Test connection with your database client

---

## Quick Reference

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Check environment variables
node scripts/setup-env-production.js

# Verify .env file exists
cat .env  # Linux/Mac
type .env  # Windows
```

---

**Last Updated:** [Current Date]
**For Questions:** Check the main README.md or PRE_LAUNCH_CHECKLIST.md


