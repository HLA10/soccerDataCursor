require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function movePlayersToF2011A() {
  try {
    console.log('🔄 Moving players from F2012-A to F2011-A...\n')

    // Find both teams
    const f2011a = await prisma.team.findFirst({
      where: {
        OR: [
          { code: 'F2011-A' },
          { name: { contains: 'F2011-A' } }
        ]
      }
    })

    const f2012a = await prisma.team.findFirst({
      where: {
        OR: [
          { code: 'F2012-A' },
          { name: { contains: 'F2012-A' } }
        ]
      }
    })

    if (!f2011a) {
      console.error('❌ F2011-A team not found')
      return
    }

    if (!f2012a) {
      console.error('❌ F2012-A team not found')
      return
    }

    console.log(`✅ Found F2011-A: ${f2011a.name} (ID: ${f2011a.id})`)
    console.log(`✅ Found F2012-A: ${f2012a.name} (ID: ${f2012a.id})\n`)

    // List of player names to move (case-insensitive matching)
    const playerNamesToMove = [
      'lexi',
      'lavornia',
      'meja',
      'liva',
      'sally',
      'elsa',
      'stella',
      'nora',
      'felicia',
      'isabella',
      'mathilda',
      'claudia',
      'olivia',
      'celine'
    ]

    console.log('🔍 Searching for players in F2012-A...\n')

    // Find all players in F2012-A
    const playersInF2012a = await prisma.player.findMany({
      where: {
        primaryTeamId: f2012a.id
      }
    })

    console.log(`Found ${playersInF2012a.length} players in F2012-A\n`)

    // Match players by name (case-insensitive)
    const playersToMove = playersInF2012a.filter(player => {
      const playerNameLower = player.name.toLowerCase()
      return playerNamesToMove.some(name => playerNameLower.includes(name.toLowerCase()))
    })

    if (playersToMove.length === 0) {
      console.log('❌ No matching players found in F2012-A')
      return
    }

    console.log(`📋 Players to move (${playersToMove.length}):`)
    playersToMove.forEach((player, index) => {
      console.log(`  ${index + 1}. ${player.name} (ID: ${player.id})`)
    })

    console.log('\n🔄 Moving players...\n')

    let movedCount = 0
    for (const player of playersToMove) {
      try {
        // Update primary team
        await prisma.player.update({
          where: { id: player.id },
          data: { primaryTeamId: f2011a.id }
        })

        // Remove from F2012-A TeamPlayer
        await prisma.teamPlayer.deleteMany({
          where: {
            playerId: player.id,
            teamId: f2012a.id
          }
        })

        // Add to F2011-A TeamPlayer (if not already there)
        const existingTeamPlayer = await prisma.teamPlayer.findUnique({
          where: {
            playerId_teamId: {
              playerId: player.id,
              teamId: f2011a.id
            }
          }
        })

        if (!existingTeamPlayer) {
          await prisma.teamPlayer.create({
            data: {
              playerId: player.id,
              teamId: f2011a.id,
              isBorrowed: false
            }
          })
        }

        movedCount++
        console.log(`  ✓ Moved ${player.name} to F2011-A`)
      } catch (error) {
        console.error(`  ❌ Error moving ${player.name}:`, error.message)
      }
    }

    // Verify final state
    console.log('\n📊 Final state:')
    const finalF2011aPlayers = await prisma.player.count({
      where: { primaryTeamId: f2011a.id }
    })
    const finalF2012aPlayers = await prisma.player.count({
      where: { primaryTeamId: f2012a.id }
    })

    console.log(`  F2011-A: ${finalF2011aPlayers} players`)
    console.log(`  F2012-A: ${finalF2012aPlayers} players`)
    console.log(`\n✅ Successfully moved ${movedCount} players to F2011-A`)

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

movePlayersToF2011A()





