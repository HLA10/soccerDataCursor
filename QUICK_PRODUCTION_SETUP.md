# Quick Production Database Setup

## The Problem
Your production database is empty - no tables, no admin user.

## The Solution (Choose One Method)

### Method 1: Using Vercel Dashboard (Easiest - No CLI needed)

1. **Get your DATABASE_URL from Vercel:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Find `DATABASE_URL` and click to reveal the value
   - Copy the entire connection string

2. **Run migrations:**
   Open PowerShell in your project folder and run:
   ```powershell
   cd C:\Projects\SoccerDataCursor
   $env:DATABASE_URL = "paste-your-database-url-here"
   npx prisma migrate deploy
   ```

3. **Create admin user:**
   ```powershell
   # Make sure DATABASE_URL is still set
   node scripts/create-admin.js admin@example.com admin123456 "Admin User"
   ```

4. **Done!** Try logging in at your Vercel URL.

---

### Method 2: Using Vercel CLI

1. **Login to Vercel:**
   ```powershell
   vercel login
   ```
   (This will open a browser for authentication)

2. **Link your project:**
   ```powershell
   cd C:\Projects\SoccerDataCursor
   vercel link
   ```
   (Select your project when prompted)

3. **Pull environment variables:**
   ```powershell
   vercel env pull .env.production
   ```

4. **Run migrations:**
   ```powershell
   $envContent = Get-Content .env.production -Raw
   if ($envContent -match 'DATABASE_URL=(.+)') {
       $env:DATABASE_URL = $matches[1].Trim()
   }
   npx prisma migrate deploy
   ```

5. **Create admin user:**
   ```powershell
   # DATABASE_URL should still be set from step 4
   node scripts/create-admin.js admin@example.com admin123456 "Admin User"
   ```

---

## What These Commands Do

- **`npx prisma migrate deploy`**: Creates all database tables in production
- **`node scripts/create-admin.js ...`**: Creates an admin user with email/password

## After Setup

Login credentials:
- **Email:** `admin@example.com`
- **Password:** `admin123456`

## Troubleshooting

**"Database does not exist"**
- Check your DATABASE_URL is correct
- Make sure your database provider has the database created

**"Connection refused"**
- Make sure DATABASE_URL includes `?sslmode=require` for production
- Check your database provider allows connections from Vercel's IPs

**"User already exists"**
- The admin user was already created
- Try logging in with the credentials above

