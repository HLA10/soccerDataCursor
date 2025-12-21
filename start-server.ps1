# Kill any existing Node processes
Write-Host "Stopping existing Node processes..."
taskkill /F /IM node.exe 2>&1 | Out-Null
Start-Sleep -Seconds 2

# Clear Next.js cache
Write-Host "Clearing Next.js cache..."
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Start the development server
Write-Host "Starting development server..."
npm run dev



