require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugCalendar() {
  try {
    console.log('🔍 Debugging calendar data...\n')

    // Get all teams
    const teams = await prisma.team.findMany()
    console.log(`📋 Teams: ${teams.length}`)
    teams.forEach(team => {
      console.log(`  - ${team.name} (ID: ${team.id})`)
    })

    // Get all games
    const games = await prisma.game.findMany({
      include: {
        team: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 10
    })
    console.log(`\n🏆 Games: ${games.length} total`)
    games.forEach(game => {
      console.log(`  - ${game.opponent} on ${game.date.toISOString().split('T')[0]} (Team: ${game.team?.name || 'N/A'})`)
    })

    // Get all trainings
    const trainings = await prisma.trainingSession.findMany({
      include: {
        team: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 10
    })
    console.log(`\n⚽ Trainings: ${trainings.length} total`)
    trainings.forEach(training => {
      console.log(`  - Training on ${training.date.toISOString().split('T')[0]} at ${training.startTime} (Team: ${training.team?.name || 'N/A'})`)
    })

    // Check for recent events
    const today = new Date()
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const recentGames = await prisma.game.findMany({
      where: {
        date: {
          gte: thisMonth,
          lte: nextMonth
        }
      },
      include: {
        team: true
      }
    })

    const recentTrainings = await prisma.trainingSession.findMany({
      where: {
        date: {
          gte: thisMonth,
          lte: nextMonth
        }
      },
      include: {
        team: true
      }
    })

    console.log(`\n📅 This Month's Events:`)
    console.log(`  Games: ${recentGames.length}`)
    console.log(`  Trainings: ${recentTrainings.length}`)

    if (recentGames.length > 0) {
      console.log('\n  Recent Games:')
      recentGames.forEach(game => {
        console.log(`    - ${game.opponent} on ${game.date.toISOString().split('T')[0]}`)
      })
    }

    if (recentTrainings.length > 0) {
      console.log('\n  Recent Trainings:')
      recentTrainings.forEach(training => {
        console.log(`    - Training on ${training.date.toISOString().split('T')[0]} at ${training.startTime}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugCalendar()





