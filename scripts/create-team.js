const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTeam() {
  try {
    // Check if team already exists
    const existingTeam = await prisma.team.findFirst({
      where: {
        OR: [
          { name: 'Djugarden F2012-A' },
          { code: 'F2012-A' }
        ]
      }
    })

    if (existingTeam) {
      console.log('Team "Djugarden F2012-A" already exists!')
      console.log('Team ID:', existingTeam.id)
      return
    }

    // Create the new team
    const team = await prisma.team.create({
      data: {
        name: 'Djugarden F2012-A',
        code: 'F2012-A',
      },
    })

    console.log('✅ Team created successfully!')
    console.log('Team ID:', team.id)
    console.log('Team Name:', team.name)
    console.log('Team Code:', team.code)
  } catch (error) {
    console.error('❌ Error creating team:', error)
    if (error.code === 'P2002') {
      console.error('Team with this code already exists')
    }
  } finally {
    await prisma.$disconnect()
  }
}

createTeam()


