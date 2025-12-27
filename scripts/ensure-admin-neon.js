require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL required')
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function main() {
  try {
    console.log('Connecting to Neon database...')
    await prisma.$connect()
    console.log('✅ Connected')
    
    const email = 'admin@example.com'
    const password = 'admin123456'
    
    console.log('Checking for admin user...')
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, status: true }
    })
    
    if (existing) {
      console.log('✅ Admin user exists!')
      console.log('Email:', existing.email)
      console.log('Name:', existing.name)
      console.log('Role:', existing.role)
      console.log('Status:', existing.status)
      
      // Update password to ensure it's correct
      console.log('Updating password...')
      const hash = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { email },
        data: { 
          password: hash,
          status: 'ACTIVE'
        }
      })
      console.log('✅ Password updated!')
      
      // Verify password
      const updated = await prisma.user.findUnique({ where: { email } })
      const isValid = await bcrypt.compare(password, updated.password)
      console.log('Password verification:', isValid ? '✅ VALID' : '❌ INVALID')
    } else {
      console.log('❌ Admin user not found. Creating...')
      const hash = await bcrypt.hash(password, 10)
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hash,
          name: 'Admin User',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      })
      console.log('✅ Admin user created!')
      console.log('User:', newUser)
    }
    
    console.log('')
    console.log('========================================')
    console.log('✅ Admin User Ready!')
    console.log('========================================')
    console.log('Login credentials:')
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)
    console.log('')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code) console.error('Error code:', error.code)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()


