require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    const users = await prisma.user.findMany({ take: 1 })
    console.log('✅ Database connection OK')
    console.log(`Found ${users.length} user(s) in database`)
    
    if (users.length > 0) {
      console.log('Sample user:', users[0].email)
    }
  } catch (error) {
    console.error('❌ Database error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()



