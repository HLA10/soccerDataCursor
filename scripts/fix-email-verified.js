require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixEmailVerified() {
  try {
    console.log('Fixing emailVerified field in database...')
    
    // Use raw SQL to fix the boolean values
    await prisma.$executeRaw`
      UPDATE users 
      SET "emailVerified" = NULL 
      WHERE "emailVerified" = false OR "emailVerified" = true
    `
    
    console.log('✅ Fixed emailVerified field')
    
    // Verify the fix
    const users = await prisma.users.findMany({
      select: {
        email: true,
        emailVerified: true,
      }
    })
    
    console.log(`\n✅ Verified ${users.length} users`)
    users.forEach(user => {
      console.log(`   ${user.email}: emailVerified = ${user.emailVerified || 'NULL'}`)
    })
    
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

fixEmailVerified()


