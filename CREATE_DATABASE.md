# How to Create the PostgreSQL Database

## Method 1: Using Command Line (psql)

### Step 1: Open PowerShell or Command Prompt

### Step 2: Navigate to PostgreSQL bin directory (or use full path)

```powershell
cd "C:\Program Files\PostgreSQL\18\bin"
```

### Step 3: Create the database

```powershell
$env:PGPASSWORD="temp123"
.\psql.exe -U postgres -h localhost -c "CREATE DATABASE football_cms;"
```

**Or in one line:**
```powershell
$env:PGPASSWORD="temp123"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE football_cms;"
```

**If you used a different password:**
Replace `temp123` with your actual PostgreSQL password.

### Step 4: Verify it was created

```powershell
$env:PGPASSWORD="temp123"
.\psql.exe -U postgres -h localhost -c "\l" | Select-String "football_cms"
```

You should see `football_cms` in the list.

---

## Method 2: Using pgAdmin (GUI - Easier)

### Step 1: Open pgAdmin

- From Start Menu, search for "pgAdmin"
- Or find it in: `C:\Program Files\PostgreSQL\18\bin\pgAdmin4.exe`

### Step 2: Connect to PostgreSQL Server

1. In the left panel, expand "Servers"
2. Click on "PostgreSQL 18" (or your server name)
3. Enter password when prompted: `temp123` (or your password)
4. Click "OK"

### Step 3: Create Database

1. Right-click on "Databases" in the left panel
2. Select "Create" → "Database..."
3. In the "Database" field, enter: `football_cms`
4. Click "Save"

### Step 4: Verify

You should now see `football_cms` listed under "Databases" in the left panel.

---

## Method 3: Using SQL Query Tool in pgAdmin

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "PostgreSQL 18" → "Query Tool"
4. Enter this SQL command:

```sql
CREATE DATABASE football_cms;
```

5. Click the "Execute" button (or press F5)
6. You should see "Query returned successfully"

---

## Troubleshooting

### "Password authentication failed"

**Solution:** Update the password in the command:
```powershell
$env:PGPASSWORD="YOUR_ACTUAL_PASSWORD"
```

Or update the `.env` file with your actual password.

### "Database already exists"

**Solution:** That's fine! The database is already created. You can skip this step.

### "psql: command not found"

**Solution:** Use the full path:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE football_cms;"
```

**Note:** The version number (18) might be different if you installed a different version. Check:
- `C:\Program Files\PostgreSQL\17\bin\`
- `C:\Program Files\PostgreSQL\16\bin\`
- etc.

### "Permission denied"

**Solution:** Make sure you're using the `postgres` user (default superuser).

---

## Quick Check: Is the database already created?

Run this command to check:

```powershell
$env:PGPASSWORD="temp123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "\l" | Select-String "football_cms"
```

If you see `football_cms` in the output, it's already created!

---

## After Creating the Database

Once the database is created, continue with:

1. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Create admin user:**
   ```bash
   npm run create-admin
   ```

4. **Start the app:**
   ```bash
   npm run dev
   ```




