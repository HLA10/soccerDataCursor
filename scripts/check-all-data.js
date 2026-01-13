require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAllData() {
  try {
    console.log('Checking all data in database...\n')
    
    const [players, games, teams, tournaments, users, gameStats, injuries, illnesses, comments] = await Promise.all([
      prisma.players.findMany({ select: { id: true, name: true } }),
      prisma.games.findMany({ select: { id: true, date: true, opponent: true } }),
      prisma.teams.findMany({ select: { id: true, name: true } }),
      prisma.tournaments.findMany({ select: { id: true, name: true } }),
      prisma.users.findMany({ select: { id: true, email: true, name: true } }),
      prisma.game_stats.findMany({ select: { id: true } }),
      prisma.injuries.findMany({ select: { id: true } }),
      prisma.illnesses.findMany({ select: { id: true } }),
      prisma.development_comments.findMany({ select: { id: true } }),
    ])
    
    console.log('📊 Database Summary:')
    console.log(`   Players: ${players.length}`)
    console.log(`   Games: ${games.length}`)
    console.log(`   Teams: ${teams.length}`)
    console.log(`   Tournaments: ${tournaments.length}`)
    console.log(`   Users: ${users.length}`)
    console.log(`   Game Stats: ${gameStats.length}`)
    console.log(`   Injuries: ${injuries.length}`)
    console.log(`   Illnesses: ${illnesses.length}`)
    console.log(`   Comments: ${comments.length}`)
    
    if (players.length > 0) {
      console.log('\n📋 Sample Players:')
      players.slice(0, 5).forEach(p => console.log(`   - ${p.name} (${p.id.substring(0, 8)}...)`))
    }
    
    if (games.length > 0) {
      console.log('\n📋 Sample Games:')
      games.slice(0, 5).forEach(g => console.log(`   - ${g.opponent} on ${g.date.toISOString().split('T')[0]}`))
    }
    
    if (teams.length > 0) {
      console.log('\n📋 Teams:')
      teams.forEach(t => console.log(`   - ${t.name} (${t.id.substring(0, 8)}...)`))
    }
    
    if (users.length > 0) {
      console.log('\n📋 Users:')
      users.forEach(u => console.log(`   - ${u.email} (${u.name || 'No name'})`))
    }
    
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkAllData()


