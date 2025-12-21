require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (users.length === 0) {
      console.log('❌ No users found in database!')
      console.log('\nTo create an admin user, run:')
      console.log('node scripts/create-admin.js admin@example.com admin123 "Admin User"')
      return
    }

    console.log(`✅ Found ${users.length} user(s):\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Status: ${user.status}`)
      if (user.status !== 'ACTIVE') {
        console.log(`   ⚠️  Status is "${user.status}" - user cannot login!`)
      }
      console.log(`   Created: ${user.createdAt}`)
      console.log('')
    })

    const inactiveUsers = users.filter(u => u.status !== 'ACTIVE')
    if (inactiveUsers.length > 0) {
      console.log('\n⚠️  Users that cannot login (status is not ACTIVE):')
      inactiveUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.status})`)
      })
      console.log('\nTo activate a user, you can:')
      console.log('1. Use the admin panel at /admin/invitations')
      console.log('2. Or run SQL: UPDATE users SET status = \'ACTIVE\' WHERE email = \'<email>\';')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()



const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (users.length === 0) {
      console.log('❌ No users found in database!')
      console.log('\nTo create an admin user, run:')
      console.log('node scripts/create-admin.js admin@example.com admin123 "Admin User"')
      return
    }

    console.log(`✅ Found ${users.length} user(s):\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Status: ${user.status}`)
      if (user.status !== 'ACTIVE') {
        console.log(`   ⚠️  Status is "${user.status}" - user cannot login!`)
      }
      console.log(`   Created: ${user.createdAt}`)
      console.log('')
    })

    const inactiveUsers = users.filter(u => u.status !== 'ACTIVE')
    if (inactiveUsers.length > 0) {
      console.log('\n⚠️  Users that cannot login (status is not ACTIVE):')
      inactiveUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.status})`)
      })
      console.log('\nTo activate a user, you can:')
      console.log('1. Use the admin panel at /admin/invitations')
      console.log('2. Or run SQL: UPDATE users SET status = \'ACTIVE\' WHERE email = \'<email>\';')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()



