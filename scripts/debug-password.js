require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function debugPassword() {
  try {
    const email = 'admin@example.com'
    const password = 'Admin123456'
    
    console.log('Step 1: Getting current user...')
    const userBefore = await prisma.user.findUnique({
      where: { email },
      select: { password: true }
    })
    
    if (!userBefore) {
      console.log('❌ User not found!')
      return
    }
    
    console.log('Current password hash (first 20 chars):', userBefore.password.substring(0, 20))
    
    console.log('\nStep 2: Hashing new password...')
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('New password hash (first 20 chars):', hashedPassword.substring(0, 20))
    
    console.log('\nStep 3: Updating password in database...')
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })
    console.log('✅ Password updated')
    
    console.log('\nStep 4: Reading password back from database...')
    const userAfter = await prisma.user.findUnique({
      where: { email },
      select: { password: true }
    })
    
    console.log('Password hash after update (first 20 chars):', userAfter?.password.substring(0, 20))
    
    console.log('\nStep 5: Testing password comparison...')
    const isValid = await bcrypt.compare(password, userAfter.password)
    console.log('Password comparison result:', isValid ? '✅ VALID' : '❌ INVALID')
    
    if (!isValid) {
      console.log('\n⚠️  Something is wrong! The password we just set is not matching!')
      console.log('Testing with the hash we created:')
      const testWithOriginalHash = await bcrypt.compare(password, hashedPassword)
      console.log('Test with original hash:', testWithOriginalHash ? '✅ VALID' : '❌ INVALID')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

debugPassword()



const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function debugPassword() {
  try {
    const email = 'admin@example.com'
    const password = 'Admin123456'
    
    console.log('Step 1: Getting current user...')
    const userBefore = await prisma.user.findUnique({
      where: { email },
      select: { password: true }
    })
    
    if (!userBefore) {
      console.log('❌ User not found!')
      return
    }
    
    console.log('Current password hash (first 20 chars):', userBefore.password.substring(0, 20))
    
    console.log('\nStep 2: Hashing new password...')
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('New password hash (first 20 chars):', hashedPassword.substring(0, 20))
    
    console.log('\nStep 3: Updating password in database...')
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })
    console.log('✅ Password updated')
    
    console.log('\nStep 4: Reading password back from database...')
    const userAfter = await prisma.user.findUnique({
      where: { email },
      select: { password: true }
    })
    
    console.log('Password hash after update (first 20 chars):', userAfter?.password.substring(0, 20))
    
    console.log('\nStep 5: Testing password comparison...')
    const isValid = await bcrypt.compare(password, userAfter.password)
    console.log('Password comparison result:', isValid ? '✅ VALID' : '❌ INVALID')
    
    if (!isValid) {
      console.log('\n⚠️  Something is wrong! The password we just set is not matching!')
      console.log('Testing with the hash we created:')
      const testWithOriginalHash = await bcrypt.compare(password, hashedPassword)
      console.log('Test with original hash:', testWithOriginalHash ? '✅ VALID' : '❌ INVALID')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

debugPassword()



