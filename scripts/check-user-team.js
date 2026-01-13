require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUserTeam() {
  try {
    const user = await prisma.users.findUnique({
      where: { email: 'admin@example.com' },
      include: {
        teams: true,
      }
    })
    
    if (!user) {
      console.log('❌ User not found')
      process.exit(1)
    }
    
    console.log('👤 User Info:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Team ID: ${user.teamId || 'NOT SET'}`)
    
    if (user.teams) {
      console.log(`   Team: ${user.teams.name}`)
    } else {
      console.log('   ⚠️  User is not associated with a team!')
      console.log('\n📋 Available teams:')
      const teams = await prisma.teams.findMany()
      teams.forEach(t => console.log(`   - ${t.name} (${t.id})`))
    }
    
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkUserTeam()


