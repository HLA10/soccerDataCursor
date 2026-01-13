const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('Checking database connection...')
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      }
    })
    
    console.log(`\n✅ Database connection successful!`)
    console.log(`📊 Users found: ${users.length}\n`)
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database!')
      console.log('   You need to create an admin user first.')
      console.log('   Run: npm run create-admin')
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`)
        console.log(`   - Name: ${user.name || 'N/A'}`)
        console.log(`   - Role: ${user.role}`)
        console.log(`   - Status: ${user.status}`)
        console.log('')
      })
    }
    
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === 'P1001') {
      console.error('   Database connection failed. Check DATABASE_URL in .env file')
    }
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkUsers()


