require('dotenv').config()
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔍 Diagnosing site issues...\n')

// Check Node version
console.log('1. Checking Node.js version...')
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim()
  console.log(`   ✅ Node.js: ${nodeVersion}`)
} catch (e) {
  console.log('   ❌ Node.js not found')
}

// Check npm version
console.log('\n2. Checking npm version...')
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim()
  console.log(`   ✅ npm: ${npmVersion}`)
} catch (e) {
  console.log('   ❌ npm not found')
}

// Check .env file
console.log('\n3. Checking environment variables...')
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file exists')
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const hasDbUrl = envContent.includes('DATABASE_URL')
  const hasNextAuthUrl = envContent.includes('NEXTAUTH_URL')
  const hasNextAuthSecret = envContent.includes('NEXTAUTH_SECRET')
  
  console.log(`   ${hasDbUrl ? '✅' : '❌'} DATABASE_URL: ${hasDbUrl ? 'found' : 'missing'}`)
  console.log(`   ${hasNextAuthUrl ? '✅' : '❌'} NEXTAUTH_URL: ${hasNextAuthUrl ? 'found' : 'missing'}`)
  console.log(`   ${hasNextAuthSecret ? '✅' : '❌'} NEXTAUTH_SECRET: ${hasNextAuthSecret ? 'found' : 'missing'}`)
} else {
  console.log('   ❌ .env file not found')
}

// Check node_modules
console.log('\n4. Checking dependencies...')
const nodeModulesPath = path.join(process.cwd(), 'node_modules')
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules exists')
} else {
  console.log('   ❌ node_modules not found - run: npm install')
}

// Check Prisma client
console.log('\n5. Checking Prisma...')
const prismaClientPath = path.join(process.cwd(), 'node_modules', '@prisma', 'client')
if (fs.existsSync(prismaClientPath)) {
  console.log('   ✅ Prisma client exists')
} else {
  console.log('   ❌ Prisma client not found - run: npx prisma generate')
}

// Check TypeScript compilation
console.log('\n6. Checking TypeScript compilation...')
try {
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe', encoding: 'utf-8' })
  console.log('   ✅ No TypeScript errors')
} catch (e) {
  console.log('   ❌ TypeScript compilation errors found')
  console.log('   Error:', e.message.split('\n').slice(0, 5).join('\n'))
}

// Check port 3000
console.log('\n7. Checking port 3000...')
try {
  const netstat = execSync('netstat -ano | findstr :3000', { encoding: 'utf-8' })
  if (netstat.trim()) {
    console.log('   ⚠️  Port 3000 is in use')
    console.log('   ' + netstat.split('\n')[0])
  } else {
    console.log('   ✅ Port 3000 is available')
  }
} catch (e) {
  console.log('   ✅ Port 3000 is available')
}

console.log('\n✅ Diagnosis complete!')
console.log('\nTo see server errors, run: npm run dev')
console.log('Or use the debug script: scripts\\start-server-debug.bat')





