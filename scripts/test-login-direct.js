require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    const email = 'admin@example.com'
    const password = 'Admin123456'
    
    console.log('Testing login flow...\n')
    
    // Step 1: Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        status: true,
      }
    })
    
    if (!user) {
      console.log('❌ User not found!')
      return
    }
    
    console.log('✅ User found:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Status: ${user.status}`)
    
    if (user.status !== 'ACTIVE') {
      console.log(`\n⚠️  User status is "${user.status}" - cannot login!`)
      return
    }
    
    // Step 2: Test password
    console.log('\n🔐 Testing password...')
    const isValid = await bcrypt.compare(password, user.password)
    
    if (isValid) {
      console.log('✅ Password is CORRECT!')
      console.log('\n✅ Login should work with:')
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${password}`)
    } else {
      console.log('❌ Password is INCORRECT!')
      console.log('\nResetting password...')
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      })
      console.log('✅ Password reset! Try logging in again.')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()


const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    const email = 'admin@example.com'
    const password = 'Admin123456'
    
    console.log('Testing login flow...\n')
    
    // Step 1: Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        status: true,
      }
    })
    
    if (!user) {
      console.log('❌ User not found!')
      return
    }
    
    console.log('✅ User found:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Status: ${user.status}`)
    
    if (user.status !== 'ACTIVE') {
      console.log(`\n⚠️  User status is "${user.status}" - cannot login!`)
      return
    }
    
    // Step 2: Test password
    console.log('\n🔐 Testing password...')
    const isValid = await bcrypt.compare(password, user.password)
    
    if (isValid) {
      console.log('✅ Password is CORRECT!')
      console.log('\n✅ Login should work with:')
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${password}`)
    } else {
      console.log('❌ Password is INCORRECT!')
      console.log('\nResetting password...')
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      })
      console.log('✅ Password reset! Try logging in again.')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()

