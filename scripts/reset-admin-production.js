require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Initialize Prisma Client with explicit connection
const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

async function main() {
  const email = 'admin@example.com'
  const password = 'admin123456'
  const name = 'Admin User'

  console.log('🔐 Resetting admin password in production database...')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log('')

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set!')
    console.error('')
    console.error('To reset the admin password in production:')
    console.error('1. Get your Neon database connection string from Vercel')
    console.error('2. Set it as DATABASE_URL:')
    console.error('   $env:DATABASE_URL="postgresql://..."')
    console.error('3. Run this script again')
    process.exit(1)
  }

  // Check if it's the production database
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    console.warn('⚠️  WARNING: DATABASE_URL points to localhost!')
    console.warn('   Make sure you set the production Neon database URL!')
    console.warn('')
  }

  if (!dbUrl.includes('neon.tech')) {
    console.warn('⚠️  WARNING: DATABASE_URL does not appear to be a Neon database!')
    console.warn('   Make sure you set the production Neon database URL!')
    console.warn('')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    console.log('🔍 Looking up user...')
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, status: true }
    })

    if (existingUser) {
      console.log('✅ User found!')
      console.log(`   ID: ${existingUser.id}`)
      console.log(`   Role: ${existingUser.role}`)
      console.log(`   Status: ${existingUser.status}`)
      console.log('')
      console.log('🔄 Updating password...')
      
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          name,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      })

      console.log('✅ Password updated successfully!')
    } else {
      console.log('❌ User not found! Creating new admin user...')
      
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      })

      console.log('✅ Admin user created successfully!')
      console.log(`   ID: ${user.id}`)
    }

    console.log('')
    console.log('✅ Admin user is ready!')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('')
    console.log('You can now log in to your Vercel deployment!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === 'P2021') {
      console.error('')
      console.error('Database connection error!')
      console.error('Make sure DATABASE_URL is correct and the database is accessible.')
    }
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

