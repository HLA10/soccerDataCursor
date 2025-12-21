require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const newPassword = process.argv[3]

  if (!email) {
    console.log('Usage: node scripts/reset-password.js <email> [new-password]')
    console.log('Example: node scripts/reset-password.js admin@example.com newpassword123')
    process.exit(1)
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        password: true,
      }
    })

    if (!user) {
      console.log(`❌ User with email "${email}" not found!`)
      console.log('\nTo create a new admin user, run:')
      console.log(`node scripts/create-admin.js ${email} password123 "User Name"`)
      process.exit(1)
    }

    console.log('✅ User found:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Status: ${user.status}`)

    if (user.status !== 'ACTIVE') {
      console.log(`\n⚠️  WARNING: User status is "${user.status}"`)
      console.log('   User must be ACTIVE to login')
      console.log('\nTo activate user, run:')
      console.log(`   UPDATE users SET status = 'ACTIVE' WHERE email = '${email}';`)
    }

    // If new password provided, reset it
    if (newPassword) {
      if (newPassword.length < 6) {
        console.log('\n❌ Password must be at least 6 characters!')
        process.exit(1)
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          status: 'ACTIVE', // Also activate the user
        }
      })

      console.log('\n✅ Password reset successfully!')
      console.log(`\nYou can now login with:`)
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${newPassword}`)
    } else {
      // Test current password
      console.log('\n📋 Current password status:')
      console.log('   (Password hash exists in database)')
      
      // Test with common passwords
      const testPasswords = ['admin123', 'password', '123456', 'admin', 'password123']
      console.log('\n🔍 Testing common passwords...')
      
      for (const testPwd of testPasswords) {
        const isValid = await bcrypt.compare(testPwd, user.password)
        if (isValid) {
          console.log(`   ✅ Password matches: "${testPwd}"`)
          console.log(`\nYou can login with:`)
          console.log(`   Email: ${email}`)
          console.log(`   Password: ${testPwd}`)
          process.exit(0)
        }
      }
      
      console.log('   ❌ None of the common passwords match')
      console.log('\n💡 To reset password, run:')
      console.log(`   node scripts/reset-password.js ${email} yournewpassword`)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === 'P2025') {
      console.error('User not found in database')
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()



const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const newPassword = process.argv[3]

  if (!email) {
    console.log('Usage: node scripts/reset-password.js <email> [new-password]')
    console.log('Example: node scripts/reset-password.js admin@example.com newpassword123')
    process.exit(1)
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        password: true,
      }
    })

    if (!user) {
      console.log(`❌ User with email "${email}" not found!`)
      console.log('\nTo create a new admin user, run:')
      console.log(`node scripts/create-admin.js ${email} password123 "User Name"`)
      process.exit(1)
    }

    console.log('✅ User found:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Status: ${user.status}`)

    if (user.status !== 'ACTIVE') {
      console.log(`\n⚠️  WARNING: User status is "${user.status}"`)
      console.log('   User must be ACTIVE to login')
      console.log('\nTo activate user, run:')
      console.log(`   UPDATE users SET status = 'ACTIVE' WHERE email = '${email}';`)
    }

    // If new password provided, reset it
    if (newPassword) {
      if (newPassword.length < 6) {
        console.log('\n❌ Password must be at least 6 characters!')
        process.exit(1)
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          status: 'ACTIVE', // Also activate the user
        }
      })

      console.log('\n✅ Password reset successfully!')
      console.log(`\nYou can now login with:`)
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${newPassword}`)
    } else {
      // Test current password
      console.log('\n📋 Current password status:')
      console.log('   (Password hash exists in database)')
      
      // Test with common passwords
      const testPasswords = ['admin123', 'password', '123456', 'admin', 'password123']
      console.log('\n🔍 Testing common passwords...')
      
      for (const testPwd of testPasswords) {
        const isValid = await bcrypt.compare(testPwd, user.password)
        if (isValid) {
          console.log(`   ✅ Password matches: "${testPwd}"`)
          console.log(`\nYou can login with:`)
          console.log(`   Email: ${email}`)
          console.log(`   Password: ${testPwd}`)
          process.exit(0)
        }
      }
      
      console.log('   ❌ None of the common passwords match')
      console.log('\n💡 To reset password, run:')
      console.log(`   node scripts/reset-password.js ${email} yournewpassword`)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === 'P2025') {
      console.error('User not found in database')
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()



