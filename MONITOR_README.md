# Site Monitor Robot 🤖

A background monitoring service that keeps your site running smoothly by:
- ✅ Auto-restarting the server if it crashes
- ✅ Performing health checks every 30 seconds
- ✅ Cleaning unused cache every hour
- ✅ Monitoring server uptime and performance

## How to Use

### Option 1: Run with Monitor (Recommended)
```bash
npm run monitor
```

This will:
- Start the Next.js dev server
- Monitor it in the background
- Auto-restart on crashes
- Clean cache periodically

### Option 2: Run Monitor Separately
If your server is already running, you can start just the monitor:
```bash
node scripts/site-monitor.js
```

### Option 3: Windows Batch File
Double-click `scripts/start-monitor.bat` or run:
```bash
scripts\start-monitor.bat
```

## Features

### Auto-Restart
- Automatically restarts the server if it crashes
- Maximum 10 restart attempts before stopping
- 5-second delay between restarts

### Health Checks
- Checks server health every 30 seconds
- Uses `/api/health` endpoint
- Restarts server if health check fails for 2+ minutes

### Cache Cleanup
- Cleans Next.js build cache every hour
- Removes unused `.next/cache` directories
- Cleans npm cache periodically
- Keeps site running fast

### Monitoring
- Logs all activities to console
- Tracks restart attempts
- Monitors server uptime

## Health Check Endpoint

The monitor uses `/api/health` to check if the server is running:
- Returns `200 OK` if healthy
- Returns `503` if database connection fails
- Includes uptime and timestamp

## Stopping the Monitor

Press `Ctrl+C` to gracefully stop the monitor and server.

## Configuration

You can modify these settings in `scripts/site-monitor.js`:
- `healthCheckInterval`: How often to check health (default: 30 seconds)
- `cacheCleanInterval`: How often to clean cache (default: 1 hour)
- `maxRestarts`: Maximum restart attempts (default: 10)
- `restartDelay`: Delay before restarting (default: 5 seconds)

## Troubleshooting

If the monitor keeps restarting:
1. Check the terminal for error messages
2. Verify your database connection
3. Check if port 3000 is available
4. Review Next.js compilation errors

## Production Use

For production, consider using:
- PM2 process manager
- Docker with health checks
- Kubernetes liveness probes
- Systemd services (Linux)

The monitor is designed for development. For production, use proper process managers.





