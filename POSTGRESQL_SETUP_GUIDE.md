# PostgreSQL Setup Guide - Step by Step

## Step 1: Install PostgreSQL

### Download and Install

1. **Go to PostgreSQL download page:**
   - Visit: https://www.postgresql.org/download/windows/
   - Click "Download the installer"

2. **Run the installer:**
   - Choose the latest version (15.x or 16.x recommended)
   - Click through the installation wizard
   - **IMPORTANT:** When prompted for a password, set it to: `temp123`
     - This matches the temporary password in your `.env` file
     - You can change it later if needed
   - Port: Keep the default (5432)
   - Locale: Keep default
   - Finish the installation

3. **Verify Installation:**
   - PostgreSQL service should start automatically
   - You can verify by opening **pgAdmin** (comes with PostgreSQL)
   - Or check Windows Services: Press `Win + R`, type `services.msc`, look for "postgresql"

## Step 2: Create the Database

### Option A: Using pgAdmin (GUI - Recommended)

1. Open **pgAdmin** from Start Menu
2. Connect to your PostgreSQL server (you'll need the password: `temp123`)
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `football_cms`
5. Click "Save"

### Option B: Using psql Command Line

1. Open Command Prompt or PowerShell
2. Navigate to PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\16\bin`)
3. Run:
   ```bash
   psql -U postgres
   ```
4. Enter password when prompted: `temp123`
5. Run:
   ```sql
   CREATE DATABASE football_cms;
   ```
6. Exit:
   ```sql
   \q
   ```

### Option C: Using SQL Command Directly

```bash
psql -U postgres -c "CREATE DATABASE football_cms;"
```
(You'll be prompted for password: `temp123`)

## Step 3: Verify .env File

Your `.env` file should already be configured with:
```
DATABASE_URL="postgresql://postgres:temp123@localhost:5432/football_cms?schema=public"
```

**If you used a different password during installation:**
- Edit `.env` file
- Replace `temp123` with your actual PostgreSQL password

## Step 4: Run Database Migration

In your project directory, run:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This will:
- Generate Prisma client
- Create all database tables
- Set up relationships

## Step 5: Create Admin User

```bash
npm run create-admin
```

This creates:
- Email: `admin@example.com`
- Password: `admin123`

## Step 6: Start the Application

```bash
npm run dev
```

Then visit: **http://localhost:3000/login**

## Troubleshooting

### "Can't reach database server"
- **Solution:** Make sure PostgreSQL service is running
  - Open Services (`services.msc`)
  - Find "postgresql-x64-16" (or similar)
  - Right-click → Start (if stopped)

### "Password authentication failed"
- **Solution:** Update `.env` file with correct password
- Or reset PostgreSQL password:
  ```bash
  psql -U postgres
  ALTER USER postgres PASSWORD 'temp123';
  ```

### "Database does not exist"
- **Solution:** Create the database using Step 2 above

### "Connection refused"
- **Solution:** 
  - Check if PostgreSQL is running
  - Verify port 5432 is not blocked by firewall
  - Check if PostgreSQL is listening: `netstat -an | findstr 5432`

### "psql: command not found"
- **Solution:** Add PostgreSQL bin directory to PATH:
  - Usually: `C:\Program Files\PostgreSQL\16\bin`
  - Or use full path: `"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres`

## Changing the Password Later

If you want to change the PostgreSQL password:

1. Connect to PostgreSQL:
   ```bash
   psql -U postgres
   ```

2. Change password:
   ```sql
   ALTER USER postgres PASSWORD 'your-new-password';
   ```

3. Update `.env` file with the new password

## Next Steps

Once everything is set up:
1. Log in at http://localhost:3000/login
2. Start adding players, games, and tournaments!
3. Change the admin password from the UI (if you add that feature)




