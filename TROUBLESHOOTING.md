# Troubleshooting Guide

## Site Not Loading

If your site is not loading, follow these steps:

### 1. Check if Server is Running

Open a new terminal and run:
```bash
netstat -ano | findstr :3000
```

If you see output, the server is running. If not, continue to step 2.

### 2. Start the Server Manually

Stop any running Node processes:
```bash
taskkill /F /IM node.exe
```

Then start the server:
```bash
npm run dev
```

**Watch the terminal output** - you should see:
- `✓ Ready in X seconds`
- `○ Local: http://localhost:3000`

If you see errors, note them down.

### 3. Common Issues

#### Port Already in Use
If port 3000 is already in use:
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill that process (replace PID with the actual process ID)
taskkill /F /PID <PID>
```

#### Database Connection Error
If you see database errors:
1. Check your `.env` file has correct `DATABASE_URL`
2. Make sure PostgreSQL is running
3. Run: `npx prisma generate`
4. Run: `npx prisma db push` (if needed)

#### TypeScript/Compilation Errors
If you see compilation errors:
1. Run: `npx tsc --noEmit` to see all errors
2. Fix the errors shown
3. Restart the server

#### Missing Dependencies
If you see module not found errors:
```bash
npm install
npx prisma generate
```

### 4. Use the Diagnostic Script

Run the diagnostic script to check everything:
```bash
node scripts/diagnose.js
```

### 5. Use the Debug Script

To see all error output clearly:
```bash
scripts\start-server-debug.bat
```

This will show you exactly what's happening when the server starts.

### 6. Clear Cache and Restart

If nothing else works:
```bash
# Stop all Node processes
taskkill /F /IM node.exe

# Remove build cache
rmdir /s /q .next

# Regenerate Prisma
npx prisma generate

# Restart server
npm run dev
```

### 7. Check Browser Console

If the server is running but the site doesn't load:
1. Open browser DevTools (F12)
2. Check the Console tab for errors
3. Check the Network tab to see if requests are failing

## Still Not Working?

1. **Check the terminal** where `npm run dev` is running - errors will be shown there
2. **Share the error message** - copy the full error from the terminal
3. **Check browser console** - open DevTools (F12) and check for errors

## Quick Fixes

### Restart Everything
```bash
taskkill /F /IM node.exe
npm run dev
```

### Full Reset
```bash
taskkill /F /IM node.exe
rmdir /s /q .next
rmdir /s /q node_modules\.cache
npx prisma generate
npm run dev
```





