require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTeams() {
  try {
    console.log('🔍 Checking teams in database...\n')

    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' }
    })

    if (teams.length === 0) {
      console.log('❌ No teams found in database!')
      console.log('\n💡 You can create teams by:')
      console.log('   1. Visiting http://localhost:3000/onboarding')
      console.log('   2. Or using the API: POST /api/teams')
    } else {
      console.log(`✅ Found ${teams.length} team(s):\n`)
      teams.forEach(team => {
        console.log(`   - ${team.name} (Code: ${team.code || 'none'})`)
        console.log(`     ID: ${team.id}`)
        console.log(`     Created: ${team.createdAt}`)
        console.log('')
      })
    }
  } catch (error) {
    console.error('❌ Error checking teams:', error.message)
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.error('\n💡 The teams table does not exist. Run:')
      console.error('   npx prisma db push')
      console.error('   npx prisma generate')
    }
  } finally {
    await prisma.$disconnect()
  }
}

checkTeams()






const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTeams() {
  try {
    console.log('🔍 Checking teams in database...\n')

    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' }
    })

    if (teams.length === 0) {
      console.log('❌ No teams found in database!')
      console.log('\n💡 You can create teams by:')
      console.log('   1. Visiting http://localhost:3000/onboarding')
      console.log('   2. Or using the API: POST /api/teams')
    } else {
      console.log(`✅ Found ${teams.length} team(s):\n`)
      teams.forEach(team => {
        console.log(`   - ${team.name} (Code: ${team.code || 'none'})`)
        console.log(`     ID: ${team.id}`)
        console.log(`     Created: ${team.createdAt}`)
        console.log('')
      })
    }
  } catch (error) {
    console.error('❌ Error checking teams:', error.message)
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.error('\n💡 The teams table does not exist. Run:')
      console.error('   npx prisma db push')
      console.error('   npx prisma generate')
    }
  } finally {
    await prisma.$disconnect()
  }
}

checkTeams()






