# Install PostgreSQL - Quick Guide

## Option 1: Install PostgreSQL Locally

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Choose the latest version (15.x or 16.x)

2. **Run the Installer:**
   - Click "Next" through the setup
   - **Important:** When asked for a password, set it to: `temp123`
   - Remember this password - we'll use it in the .env file
   - Port: Keep default (5432)
   - Finish the installation

3. **Verify Installation:**
   - Open pgAdmin (comes with PostgreSQL)
   - Or check Windows Services for "postgresql"

4. **After Installation:**
   - The .env file is already set with password `temp123`
   - We'll create the database next

## Option 2: Use Supabase (Cloud - Free)

If you prefer not to install PostgreSQL locally:

1. Go to: https://supabase.com
2. Sign up for free account
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)
6. Update .env file with that connection string

## Option 3: Use SQLite (Simplest - No Installation)

I can modify the setup to use SQLite instead - no installation needed!

Let me know which option you prefer!




