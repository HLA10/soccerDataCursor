require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateSpecificTeamsLogo() {
  try {
    console.log('🔍 Finding Djugarden F2011-A and Djugarden F2012-A teams...\n')

    // Find the specific teams
    const team1 = await prisma.team.findFirst({
      where: {
        OR: [
          { name: 'Djugarden F2011-A' },
          { code: 'F2011-A' }
        ]
      }
    })

    const team2 = await prisma.team.findFirst({
      where: {
        OR: [
          { name: 'Djugarden F2012-A' },
          { code: 'F2012-A' }
        ]
      }
    })

    const logoPath = '/uploads/djugarden-logo.png'
    let updatedCount = 0

    if (team1) {
      await prisma.team.update({
        where: { id: team1.id },
        data: { logo: logoPath }
      })
      console.log(`✅ Updated ${team1.name} (${team1.code || 'no code'}) with logo: ${logoPath}`)
      updatedCount++
    } else {
      console.log('❌ Djugarden F2011-A team not found')
    }

    if (team2) {
      await prisma.team.update({
        where: { id: team2.id },
        data: { logo: logoPath }
      })
      console.log(`✅ Updated ${team2.name} (${team2.code || 'no code'}) with logo: ${logoPath}`)
      updatedCount++
    } else {
      console.log('❌ Djugarden F2012-A team not found')
    }

    if (updatedCount > 0) {
      console.log(`\n🎉 Successfully updated ${updatedCount} team(s) with the Djugarden logo!`)
      console.log('\n📝 Note: The logo will display automatically even if the file doesn\'t exist yet,')
      console.log('   thanks to the team-logo-utils. Make sure to save the logo file at:')
      console.log('   public/uploads/djugarden-logo.png')
    } else {
      console.log('\n⚠️  No teams were updated. Please check if the teams exist in the database.')
    }
  } catch (error) {
    console.error('❌ Error updating team logos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateSpecificTeamsLogo()











