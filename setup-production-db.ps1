# Production Database Setup Script
# This script will:
# 1. Run database migrations
# 2. Create admin user

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Production Database Setup" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is provided
if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL environment variable is not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set it first:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL = "your-production-database-url-here"' -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or run this script with:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL = "your-url"; .\setup-production-db.ps1' -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✅ DATABASE_URL is set" -ForegroundColor Green
Write-Host ""

# Step 1: Run migrations
Write-Host "Step 1: Running database migrations..." -ForegroundColor Cyan
Write-Host "This will create all database tables..." -ForegroundColor Gray
Write-Host ""

try {
    npx prisma migrate deploy
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migrations completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Migrations failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error running migrations: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Create admin user
Write-Host "Step 2: Creating admin user..." -ForegroundColor Cyan
Write-Host "Email: admin@example.com" -ForegroundColor Gray
Write-Host "Password: admin123456" -ForegroundColor Gray
Write-Host ""

try {
    node scripts/create-admin.js admin@example.com admin123456 "Admin User"
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Admin user created successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  Admin user creation may have failed (user might already exist)" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "⚠️  Error creating admin user: $_" -ForegroundColor Yellow
    Write-Host "   (User might already exist - this is okay)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now login to your production site:" -ForegroundColor Yellow
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Password: admin123456" -ForegroundColor White
Write-Host ""


