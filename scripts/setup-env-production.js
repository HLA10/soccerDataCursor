require('dotenv').config()
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

/**
 * Production Environment Setup Script
 * This script helps set up production-ready environment variables
 */

const ENV_FILE = path.join(__dirname, '..', '.env')
const ENV_EXAMPLE_FILE = path.join(__dirname, '..', '.env.example')

function generateSecret() {
  return crypto.randomBytes(32).toString('base64')
}

function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    console.log('❌ .env file not found')
    return null
  }
  return fs.readFileSync(ENV_FILE, 'utf8')
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

function updateEnvFile(vars) {
  let content = readEnvFile()
  if (!content) {
    console.log('❌ Cannot read .env file')
    return false
  }
  
  const lines = content.split('\n')
  const updatedLines = []
  const updatedVars = new Set()
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      updatedLines.push(line)
      continue
    }
    
    const match = trimmed.match(/^([^=]+)=/)
    if (match) {
      const key = match[1].trim()
      if (vars[key] !== undefined) {
        updatedLines.push(`${key}="${vars[key]}"`)
        updatedVars.add(key)
      } else {
        updatedLines.push(line)
      }
    } else {
      updatedLines.push(line)
    }
  }
  
  // Add any new variables that weren't in the file
  for (const [key, value] of Object.entries(vars)) {
    if (!updatedVars.has(key)) {
      updatedLines.push(`${key}="${value}"`)
    }
  }
  
  fs.writeFileSync(ENV_FILE, updatedLines.join('\n'))
  return true
}

function checkAndFixEnvVars() {
  console.log('🔍 Checking environment variables...\n')
  
  const content = readEnvFile()
  if (!content) {
    console.log('Please create a .env file first')
    return
  }
  
  const vars = parseEnvFile(content)
  const updates = {}
  let needsUpdate = false
  
  // Check NEXTAUTH_SECRET
  if (!vars.NEXTAUTH_SECRET || vars.NEXTAUTH_SECRET.length < 32) {
    console.log('⚠️  NEXTAUTH_SECRET is too short or missing')
    const newSecret = generateSecret()
    console.log(`   Generated new secret (${newSecret.length} chars)`)
    updates.NEXTAUTH_SECRET = newSecret
    needsUpdate = true
  } else {
    console.log(`✅ NEXTAUTH_SECRET: ${vars.NEXTAUTH_SECRET.length} chars (strong)`)
  }
  
  // Check DATABASE_URL for SSL
  if (vars.DATABASE_URL) {
    if (!vars.DATABASE_URL.includes('sslmode=')) {
      console.log('⚠️  DATABASE_URL missing SSL mode')
      console.log('   For production, add ?sslmode=require')
      console.log('   Current:', vars.DATABASE_URL.substring(0, 50) + '...')
      console.log('   Should be: ...?schema=public&sslmode=require')
      console.log('   (Not auto-updating - you need to add this manually for production)')
    } else {
      console.log('✅ DATABASE_URL has SSL mode configured')
    }
  } else {
    console.log('❌ DATABASE_URL is missing')
  }
  
  // Check NEXTAUTH_URL
  if (!vars.NEXTAUTH_URL) {
    console.log('⚠️  NEXTAUTH_URL is missing')
    updates.NEXTAUTH_URL = 'http://localhost:3000'
    needsUpdate = true
  } else {
    console.log(`✅ NEXTAUTH_URL: ${vars.NEXTAUTH_URL}`)
    if (vars.NEXTAUTH_URL.startsWith('http://') && !vars.NEXTAUTH_URL.includes('localhost')) {
      console.log('   ⚠️  Warning: Using http:// in production. Should use https://')
    }
  }
  
  if (needsUpdate && Object.keys(updates).length > 0) {
    console.log('\n📝 Updating .env file...')
    if (updateEnvFile(updates)) {
      console.log('✅ .env file updated successfully')
      console.log('\nUpdated variables:')
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'NEXTAUTH_SECRET') {
          console.log(`   ${key}: ${value.substring(0, 20)}... (${value.length} chars)`)
        } else {
          console.log(`   ${key}: ${value}`)
        }
      }
    } else {
      console.log('❌ Failed to update .env file')
    }
  }
  
  console.log('\n📋 Production Checklist:')
  console.log('  [ ] NEXTAUTH_SECRET is 32+ characters')
  console.log('  [ ] NEXTAUTH_URL matches your production domain (https://yourdomain.com)')
  console.log('  [ ] DATABASE_URL includes ?sslmode=require for production')
  console.log('  [ ] All environment variables are set in your hosting platform')
}

// Run the check
checkAndFixEnvVars()


