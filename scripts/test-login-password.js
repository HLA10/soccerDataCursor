require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function testPassword() {
  try {
    const email = 'admin@example.com'
    const testPassword = 'admin123'
    
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        email: true,
        password: true,
        status: true,
      }
    })
    
    if (!user) {
      console.log('❌ User not found')
      process.exit(1)
    }
    
    console.log('👤 User found:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Status: ${user.status}`)
    console.log(`   Password hash: ${user.password.substring(0, 30)}...`)
    console.log('\n🔐 Testing password: "admin123"')
    
    const isValid = await bcrypt.compare(testPassword, user.password)
    
    if (isValid) {
      console.log('✅ Password is CORRECT - login should work')
    } else {
      console.log('❌ Password is INCORRECT - login will fail')
      console.log('\n💡 Resetting password...')
      
      const newHash = await bcrypt.hash(testPassword, 10)
      await prisma.users.update({
        where: { email },
        data: { password: newHash }
      })
      
      console.log('✅ Password has been reset to "admin123"')
    }
    
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

testPassword()
