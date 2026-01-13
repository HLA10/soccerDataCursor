require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function assignUserToTeam() {
  try {
    const userEmail = process.argv[2] || 'admin@example.com'
    const teamName = process.argv[3] || 'Djugarden F2011-A'
    
    // Find user
    const user = await prisma.users.findUnique({
      where: { email: userEmail }
    })
    
    if (!user) {
      console.log(`❌ User not found: ${userEmail}`)
      process.exit(1)
    }
    
    // Find team
    const team = await prisma.teams.findFirst({
      where: { name: teamName }
    })
    
    if (!team) {
      console.log(`❌ Team not found: ${teamName}`)
      console.log('\nAvailable teams:')
      const teams = await prisma.teams.findMany()
      teams.forEach(t => console.log(`   - ${t.name}`))
      process.exit(1)
    }
    
    // Update user with team
    const updatedUser = await prisma.users.update({
      where: { email: userEmail },
      data: { teamId: team.id }
    })
    
    console.log('✅ User assigned to team!')
    console.log(`   User: ${updatedUser.email}`)
    console.log(`   Team: ${team.name}`)
    console.log(`   Team ID: ${team.id}`)
    
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

assignUserToTeam()


