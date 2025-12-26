#!/usr/bin/env node

/**
 * Production Environment Variables Checker
 * Verifies critical environment variables are configured correctly for production
 */

const fs = require('fs')
const path = require('path')

function readEnvFile() {
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found')
    return null
  }
  return fs.readFileSync(envPath, 'utf-8')
}

function parseEnvFile(content) {
  const vars = {}
  const lines = content.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    
    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      vars[key] = value
    }
  }
  
  return vars
}

function checkEnvVars() {
  console.log('🔍 Checking production environment variables...\n')
  
  const content = readEnvFile()
  if (!content) {
    console.log('Please create a .env file first')
    return
  }
  
  const vars = parseEnvFile(content)
  let hasIssues = false
  
  // Check NEXTAUTH_SECRET
  if (!vars.NEXTAUTH_SECRET || vars.NEXTAUTH_SECRET.length < 32) {
    console.log('❌ NEXTAUTH_SECRET is too short or missing')
    console.log('   Must be at least 32 characters')
    console.log('   Generate: openssl rand -base64 32\n')
    hasIssues = true
  } else {
    console.log(`✅ NEXTAUTH_SECRET: ${vars.NEXTAUTH_SECRET.length} chars (strong)`)
  }
  
  // Check NEXTAUTH_URL
  if (!vars.NEXTAUTH_URL) {
    console.log('⚠️  NEXTAUTH_URL is missing')
    console.log('   For production, set to: https://yourdomain.com\n')
    hasIssues = true
  } else {
    console.log(`✅ NEXTAUTH_URL: ${vars.NEXTAUTH_URL}`)
    if (vars.NEXTAUTH_URL.startsWith('http://') && !vars.NEXTAUTH_URL.includes('localhost')) {
      console.log('   ⚠️  Warning: Using http:// in production. Should use https://')
      hasIssues = true
    }
  }
  
  // Check DATABASE_URL for SSL
  if (!vars.DATABASE_URL) {
    console.log('❌ DATABASE_URL is missing\n')
    hasIssues = true
  } else {
    if (vars.DATABASE_URL.includes('sslmode=')) {
      const sslMode = vars.DATABASE_URL.match(/sslmode=([^&]+)/)?.[1]
      console.log(`✅ DATABASE_URL has SSL mode: ${sslMode}`)
      if (sslMode !== 'require' && process.env.NODE_ENV === 'production') {
        console.log('   ⚠️  Warning: For production, use sslmode=require')
        hasIssues = true
      }
    } else {
      console.log('⚠️  DATABASE_URL missing SSL mode')
      console.log('   For production, add: ?sslmode=require')
      console.log('   Example: postgresql://user:pass@host:5432/db?schema=public&sslmode=require')
      console.log('   (This is OK for local development)\n')
      if (process.env.NODE_ENV === 'production') {
        hasIssues = true
      }
    }
  }
  
  console.log('')
  if (hasIssues && process.env.NODE_ENV === 'production') {
    console.log('❌ Some production environment variables need attention')
    process.exit(1)
  } else if (hasIssues) {
    console.log('⚠️  Some variables need attention for production deployment')
    console.log('   (OK for local development)')
  } else {
    console.log('✅ All environment variables are properly configured!')
  }
}

checkEnvVars()


