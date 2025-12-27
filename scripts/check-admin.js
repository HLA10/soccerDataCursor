require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: {
        email: true,
        name: true,
        role: true,
      },
    })

    if (admin) {
      console.log('✅ Admin user found:')
      console.log(`   Email: ${admin.email}`)
      console.log(`   Name: ${admin.name}`)
      console.log(`   Role: ${admin.role}`)
      console.log('')
      console.log('⚠️  Password cannot be retrieved (it\'s hashed)')
      console.log('   Default password: admin123')
      console.log('   Or if changed: admin123456')
      console.log('')
      console.log('To reset password, run:')
      console.log('   node scripts/create-admin.js admin@example.com admin123456')
    } else {
      console.log('❌ No admin user found')
      console.log('')
      console.log('Create admin user with:')
      console.log('   node scripts/create-admin.js admin@example.com admin123456')
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()


