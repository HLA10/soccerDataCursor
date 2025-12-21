require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    
    if (!user) {
      console.log('❌ User not found!')
      return
    }
    
    const testPassword = 'ueoJCpi7AJmNUgxv'
    const isValid = await bcrypt.compare(testPassword, user.password)
    
    console.log('Password test result:', isValid ? '✅ VALID' : '❌ INVALID')
    console.log('User email:', user.email)
    console.log('User status:', user.status)
    
    if (!isValid) {
      console.log('\n💡 Password does not match. Resetting password...')
      const hashedPassword = await bcrypt.hash(testPassword, 10)
      await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { password: hashedPassword }
      })
      console.log('✅ Password reset successfully!')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testPassword()



const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    
    if (!user) {
      console.log('❌ User not found!')
      return
    }
    
    const testPassword = 'ueoJCpi7AJmNUgxv'
    const isValid = await bcrypt.compare(testPassword, user.password)
    
    console.log('Password test result:', isValid ? '✅ VALID' : '❌ INVALID')
    console.log('User email:', user.email)
    console.log('User status:', user.status)
    
    if (!isValid) {
      console.log('\n💡 Password does not match. Resetting password...')
      const hashedPassword = await bcrypt.hash(testPassword, 10)
      await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { password: hashedPassword }
      })
      console.log('✅ Password reset successfully!')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testPassword()



