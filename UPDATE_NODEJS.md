# How to Update Node.js

## The Problem
Your current Node.js version (18.13.0) is too old. Next.js requires Node.js >= 18.17.0.

## Solution: Update Node.js

### Option 1: Download Latest Node.js (Easiest)

1. **Go to Node.js website:**
   - Visit: https://nodejs.org/
   - Download the **LTS version** (Long Term Support)
   - This will be version 20.x or 22.x (both work with Next.js)

2. **Run the installer:**
   - Run the downloaded `.msi` file
   - Follow the installation wizard
   - It will automatically update your Node.js

3. **Verify the update:**
   - Open a NEW terminal/PowerShell window
   - Run: `node --version`
   - You should see version 20.x or 22.x

4. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### Option 2: Use NVM (Node Version Manager) - Advanced

If you want to manage multiple Node.js versions:

1. **Install NVM for Windows:**
   - Download from: https://github.com/coreybutler/nvm-windows/releases
   - Install `nvm-setup.exe`

2. **Install Node.js 20:**
   ```bash
   nvm install 20
   nvm use 20
   ```

3. **Verify:**
   ```bash
   node --version
   ```

### Option 3: Quick Fix - Use Compatible Next.js Version (Not Recommended)

You could downgrade Next.js, but this is NOT recommended as you'll miss features and security updates.

## After Updating Node.js

1. **Close all terminal windows**
2. **Open a NEW terminal**
3. **Navigate to your project:**
   ```bash
   cd "C:\Users\huffm\OneDrive\Desktop\Soccer data cursor"
   ```
4. **Start the server:**
   ```bash
   npm run dev
   ```
5. **Wait for it to compile** (30-60 seconds)
6. **Open:** http://localhost:3000/login

## Verify It's Working

After updating, you should see:
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

Then the UI will be accessible!




