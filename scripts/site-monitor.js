require('dotenv').config()
const { spawn, exec } = require('child_process')
const fs = require('fs').promises
const path = require('path')

class SiteMonitor {
  constructor() {
    this.devServer = null
    this.isRunning = false
    this.restartCount = 0
    this.maxRestarts = 10
    this.restartDelay = 5000 // 5 seconds
    this.healthCheckInterval = 30000 // 30 seconds
    this.cacheCleanInterval = 3600000 // 1 hour
    this.lastHealthCheck = Date.now()
    this.healthCheckTimeout = 60000 // 1 minute timeout for health check
  }

  async start() {
    console.log('🤖 Site Monitor starting...')
    console.log('📊 Monitoring site health and performance')
    
    // Initial cache cleanup
    await this.cleanCache()
    
    // Start the dev server
    await this.startDevServer()
    
    // Start health checks
    this.startHealthChecks()
    
    // Start periodic cache cleanup
    this.startCacheCleanup()
    
    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())
  }

  async startDevServer() {
    if (this.isRunning) {
      console.log('⚠️  Server already running')
      return
    }

    console.log('🚀 Starting Next.js development server...')
    
    this.devServer = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    })

    this.devServer.on('error', (error) => {
      console.error('❌ Server error:', error.message)
      this.handleCrash()
    })

    this.devServer.on('exit', (code, signal) => {
      console.log(`⚠️  Server exited with code ${code}, signal ${signal}`)
      this.isRunning = false
      
      if (code !== 0 && code !== null) {
        this.handleCrash()
      }
    })

    this.isRunning = true
    this.restartCount = 0
    
    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 10000))
  }

  async handleCrash() {
    if (this.restartCount >= this.maxRestarts) {
      console.error('❌ Max restart attempts reached. Stopping monitor.')
      process.exit(1)
    }

    this.restartCount++
    console.log(`🔄 Restarting server (attempt ${this.restartCount}/${this.maxRestarts})...`)
    
    // Clean cache before restart
    await this.cleanCache()
    
    // Wait before restart
    await new Promise(resolve => setTimeout(resolve, this.restartDelay))
    
    await this.startDevServer()
  }

  async checkHealth() {
    return new Promise((resolve) => {
      const http = require('http')
      const req = http.get('http://localhost:3000/api/health', (res) => {
        if (res.statusCode === 200) {
          this.lastHealthCheck = Date.now()
          console.log('✅ Health check passed')
          resolve(true)
        } else {
          console.log('⚠️  Health check failed - server may be down')
          if (Date.now() - this.lastHealthCheck > 120000) {
            console.log('🔄 Server appears down, restarting...')
            this.handleCrash()
          }
          resolve(false)
        }
      })

      req.on('error', (error) => {
        console.log('⚠️  Health check error:', error.message)
        if (Date.now() - this.lastHealthCheck > 120000) {
          console.log('🔄 Server appears down, restarting...')
          this.handleCrash()
        }
        resolve(false)
      })

      req.setTimeout(this.healthCheckTimeout, () => {
        req.destroy()
        console.log('⚠️  Health check timeout')
        if (Date.now() - this.lastHealthCheck > 120000) {
          console.log('🔄 Server appears down, restarting...')
          this.handleCrash()
        }
        resolve(false)
      })
    })
  }

  startHealthChecks() {
    setInterval(async () => {
      await this.checkHealth()
    }, this.healthCheckInterval)
    
    console.log(`💓 Health checks running every ${this.healthCheckInterval / 1000} seconds`)
  }

  async cleanCache() {
    console.log('🧹 Cleaning cache...')
    
    const cachePaths = [
      { path: path.join(process.cwd(), '.next', 'cache'), type: 'directory' },
      { path: path.join(process.cwd(), 'node_modules', '.cache'), type: 'directory' },
    ]

    let cleaned = 0
    for (const { path: cachePath, type } of cachePaths) {
      try {
        const stats = await fs.stat(cachePath).catch(() => null)
        if (stats && stats.isDirectory()) {
          // Get directory size before cleaning
          const sizeBefore = await this.getDirSize(cachePath)
          await fs.rm(cachePath, { recursive: true, force: true })
          cleaned++
          console.log(`  ✓ Cleaned: ${path.basename(cachePath)} (${this.formatBytes(sizeBefore)})`)
        }
      } catch (error) {
        // Ignore errors - cache might not exist or be in use
      }
    }

    // Clean old build artifacts in .next/static if they exist
    try {
      const staticPath = path.join(process.cwd(), '.next', 'static')
      const stats = await fs.stat(staticPath).catch(() => null)
      if (stats && stats.isDirectory()) {
        const files = await fs.readdir(staticPath)
        const oldFiles = files.filter(f => {
          // Keep recent files, remove old ones (older than 7 days)
          return true // For now, just log - be careful not to break dev server
        })
      }
    } catch (error) {
      // Ignore
    }

    if (cleaned > 0) {
      console.log(`✅ Cleaned ${cleaned} cache location(s)`)
    } else {
      console.log('ℹ️  No cache to clean')
    }

    // Clean npm cache (run in background, don't wait)
    exec('npm cache verify', (error) => {
      if (!error) {
        console.log('✅ NPM cache verified')
      }
    })
  }

  async getDirSize(dirPath) {
    try {
      let size = 0
      const files = await fs.readdir(dirPath, { withFileTypes: true })
      for (const file of files) {
        const filePath = path.join(dirPath, file.name)
        if (file.isDirectory()) {
          size += await this.getDirSize(filePath)
        } else {
          const stats = await fs.stat(filePath).catch(() => null)
          if (stats) size += stats.size
        }
      }
      return size
    } catch {
      return 0
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  startCacheCleanup() {
    setInterval(async () => {
      await this.cleanCache()
    }, this.cacheCleanInterval)
    
    console.log(`🧹 Cache cleanup scheduled every ${this.cacheCleanInterval / 3600000} hour(s)`)
  }

  async shutdown() {
    console.log('\n🛑 Shutting down monitor...')
    
    if (this.devServer) {
      this.devServer.kill('SIGTERM')
      await new Promise(resolve => setTimeout(resolve, 2000))
      this.devServer.kill('SIGKILL')
    }
    
    console.log('✅ Monitor stopped')
    process.exit(0)
  }
}

// Start the monitor
const monitor = new SiteMonitor()
monitor.start().catch(console.error)

