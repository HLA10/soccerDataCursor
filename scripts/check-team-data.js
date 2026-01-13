require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTeamData() {
  try {
    const teamId = process.argv[2] || 'default-team-78418797-ac65-442b-9239-d02cdc553add'
    
    const team = await prisma.teams.findUnique({
      where: { id: teamId },
      include: {
        players: { take: 5 },
        games: { take: 5, orderBy: { date: 'desc' } },
      }
    })
    
    if (!team) {
      console.log('❌ Team not found')
      process.exit(1)
    }
    
    console.log(`📊 Data for team: ${team.name}\n`)
    
    const [playerCount, gameCount, gameStatsCount] = await Promise.all([
      prisma.players.count({ where: { primaryTeamId: teamId } }),
      prisma.games.count({ where: { teamId } }),
      prisma.game_stats.count({
        where: {
          games: { teamId }
        }
      })
    ])
    
    console.log(`   Players: ${playerCount}`)
    console.log(`   Games: ${gameCount}`)
    console.log(`   Game Stats: ${gameStatsCount}`)
    
    if (team.games.length > 0) {
      console.log('\n📋 Recent Games:')
      team.games.forEach(g => console.log(`   - ${g.opponent} on ${g.date.toISOString().split('T')[0]}`))
    }
    
    if (team.players.length > 0) {
      console.log('\n📋 Sample Players:')
      team.players.forEach(p => console.log(`   - ${p.name}`))
    }
    
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkTeamData()


