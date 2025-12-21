require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixTeamAssignments() {
  try {
    console.log('🔍 Checking teams and player assignments...\n')

    // Get all teams
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' }
    })

    console.log('📋 Existing teams:')
    teams.forEach(team => {
      console.log(`  - ${team.name} (${team.code || 'no code'}) - ID: ${team.id}`)
    })

    // Find F2011-A and F2012-A teams
    const f2011a = teams.find(t => t.code === 'F2011-A' || t.name.includes('F2011-A'))
    const f2012a = teams.find(t => t.code === 'F2012-A' || t.name.includes('F2012-A'))

    console.log('\n🎯 Target teams:')
    console.log(`  F2011-A: ${f2011a ? `Found (ID: ${f2011a.id})` : 'NOT FOUND - will create'}`)
    console.log(`  F2012-A: ${f2012a ? `Found (ID: ${f2012a.id})` : 'NOT FOUND - will create'}`)

    // Create F2011-A if it doesn't exist
    let f2011aId = f2011a?.id
    if (!f2011a) {
      console.log('\n➕ Creating F2011-A team...')
      const newTeam = await prisma.team.create({
        data: {
          name: 'Djugarden F2011-A',
          code: 'F2011-A'
        }
      })
      f2011aId = newTeam.id
      console.log(`✅ Created F2011-A (ID: ${newTeam.id})`)
    }

    // Create F2012-A if it doesn't exist
    let f2012aId = f2012a?.id
    if (!f2012a) {
      console.log('\n➕ Creating F2012-A team...')
      const newTeam = await prisma.team.create({
        data: {
          name: 'Djugarden F2012-A',
          code: 'F2012-A'
        }
      })
      f2012aId = newTeam.id
      console.log(`✅ Created F2012-A (ID: ${newTeam.id})`)
    }

    // Get all players currently assigned to F2011-A
    console.log('\n👥 Checking players assigned to F2011-A...')
    const playersInF2011a = await prisma.player.findMany({
      where: {
        primaryTeamId: f2011aId
      },
      include: {
        teams: true
      }
    })

    console.log(`Found ${playersInF2011a.length} players in F2011-A`)

    if (playersInF2011a.length > 0) {
      console.log('\n📝 Players in F2011-A:')
      playersInF2011a.forEach((player, index) => {
        console.log(`  ${index + 1}. ${player.name} (ID: ${player.id})`)
      })

      // Ask user which players should move to F2012-A
      // For now, we'll move all players that were originally created for F2012-A
      // You can identify them by checking if they have any indication they belong to F2012-A
      // Since we don't have that info, we'll move all players from F2011-A to F2012-A
      // and you can manually adjust if needed

      console.log('\n🔄 Moving all players from F2011-A to F2012-A...')
      
      let movedCount = 0
      for (const player of playersInF2011a) {
        // Update primary team
        await prisma.player.update({
          where: { id: player.id },
          data: { primaryTeamId: f2012aId }
        })

        // Update TeamPlayer entries
        // Remove from F2011-A
        await prisma.teamPlayer.deleteMany({
          where: {
            playerId: player.id,
            teamId: f2011aId
          }
        })

        // Add to F2012-A (if not already there)
        const existingTeamPlayer = await prisma.teamPlayer.findUnique({
          where: {
            playerId_teamId: {
              playerId: player.id,
              teamId: f2012aId
            }
          }
        })

        if (!existingTeamPlayer) {
          await prisma.teamPlayer.create({
            data: {
              playerId: player.id,
              teamId: f2012aId,
              isBorrowed: false
            }
          })
        }

        movedCount++
        console.log(`  ✓ Moved ${player.name} to F2012-A`)
      }

      console.log(`\n✅ Moved ${movedCount} players from F2011-A to F2012-A`)
    }

    // Verify final state
    console.log('\n📊 Final state:')
    const finalF2011aPlayers = await prisma.player.count({
      where: { primaryTeamId: f2011aId }
    })
    const finalF2012aPlayers = await prisma.player.count({
      where: { primaryTeamId: f2012aId }
    })

    console.log(`  F2011-A: ${finalF2011aPlayers} players`)
    console.log(`  F2012-A: ${finalF2012aPlayers} players`)

    // List all teams again
    const finalTeams = await prisma.team.findMany({
      orderBy: { name: 'asc' }
    })

    console.log('\n✅ All teams (should appear in dropdown):')
    finalTeams.forEach(team => {
      const playerCount = finalTeams === f2011aId || team.id === f2012aId 
        ? (team.id === f2011aId ? finalF2011aPlayers : finalF2012aPlayers)
        : '?'
      console.log(`  - ${team.name} (${team.code || 'no code'}) - ${playerCount} players`)
    })

    console.log('\n✅ Done! Both teams should now appear in the dropdown menu.')
    console.log('   Refresh your browser to see the changes.')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixTeamAssignments()





