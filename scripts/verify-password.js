require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: {
        email: true,
        password: true,
        role: true,
        status: true
      }
    })

    if (!user) {
      console.log('❌ User not found')
      process.exit(1)
    }

    const isValidNew = await bcrypt.compare('admin123456', user.password)
    const isValidOld = await bcrypt.compare('admin123', user.password)

    console.log('📋 Admin User Check:')
    console.log('  Email:', user.email)
    console.log('  Role:', user.role)
    console.log('  Status:', user.status)
    console.log('  Password "admin123456":', isValidNew ? '✅ VALID' : '❌ INVALID')
    console.log('  Password "admin123":', isValidOld ? '✅ VALID (old)' : '❌ INVALID')
    
    if (!isValidNew && !isValidOld) {
      console.log('\n⚠️  Neither password works! Password may need to be reset.')
    }
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()


