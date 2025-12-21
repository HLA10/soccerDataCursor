# Database Setup Instructions

## Step 1: Install PostgreSQL (if not already installed)

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation, remember the password you set for the `postgres` user
4. Make sure PostgreSQL service is running (it should start automatically)

## Step 2: Create the Database

1. Open **pgAdmin** (comes with PostgreSQL) or use **psql** command line
2. Connect to your PostgreSQL server (usually localhost, port 5432)
3. Create a new database called `football_cms`:

```sql
CREATE DATABASE football_cms;
```

**OR using psql command line:**
```bash
psql -U postgres
CREATE DATABASE football_cms;
\q
```

## Step 3: Update .env File

1. Open the `.env` file in your project root
2. Update the `DATABASE_URL` with your actual PostgreSQL credentials:

```
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/football_cms?schema=public"
```

**Replace:**
- `YOUR_USERNAME` - Usually `postgres` (or your PostgreSQL username)
- `YOUR_PASSWORD` - The password you set during PostgreSQL installation

**Example:**
```
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/football_cms?schema=public"
```

## Step 4: Run Database Migrations

Open a terminal in your project directory and run:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all the database tables
- Set up relationships
- Generate the Prisma client

**If you see an error about connection:**
- Make sure PostgreSQL is running
- Check your credentials in `.env`
- Verify the database `football_cms` exists

## Step 5: Create Admin User

Run this command to create an admin user:

```bash
npm run create-admin
```

This creates a default admin:
- Email: `admin@example.com`
- Password: `admin123`

**To create a custom admin user:**
```bash
npm run create-admin your-email@example.com your-password "Your Name"
```

## Step 6: Verify Setup

1. Start the dev server (if not running):
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000/login
3. Log in with your admin credentials
4. You should see the dashboard!

## Troubleshooting

### "Can't reach database server"
- Make sure PostgreSQL service is running
- Check Windows Services: `services.msc` → Look for "postgresql"
- Start it if it's stopped

### "Database does not exist"
- Create the database using Step 2 above

### "Password authentication failed"
- Double-check your password in `.env`
- Make sure there are no extra spaces or quotes

### "Connection refused"
- Verify PostgreSQL is listening on port 5432
- Check if firewall is blocking the connection




