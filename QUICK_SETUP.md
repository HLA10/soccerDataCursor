# Quick Database Setup Guide

## Prerequisites
- PostgreSQL installed and running
- Database credentials (username and password)

## Step 1: Update .env File

Edit the `.env` file in your project root and update this line:

```
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/football_cms?schema=public"
```

**Replace:**
- `YOUR_USERNAME` → Your PostgreSQL username (usually `postgres`)
- `YOUR_PASSWORD` → Your PostgreSQL password

**Example:**
```
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/football_cms?schema=public"
```

## Step 2: Create the Database

**Option A: Using psql command line**
```bash
psql -U postgres
CREATE DATABASE football_cms;
\q
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name it: `football_cms`
5. Click "Save"

## Step 3: Run Migrations

In your project directory, run:
```bash
npx prisma migrate dev --name init
```

This creates all the tables in your database.

## Step 4: Create Admin User

Run:
```bash
npm run create-admin
```

This creates:
- Email: `admin@example.com`
- Password: `admin123`

**Or create custom admin:**
```bash
npm run create-admin your-email@example.com your-password "Your Name"
```

## Step 5: Start the App

```bash
npm run dev
```

Then visit: **http://localhost:3000/login**

## Done! 🎉

You can now log in and start using the Football CMS!




