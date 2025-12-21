require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Checking for player accounts...\n')
    
    const players = await prisma.user.findMany({
      where: { role: 'PLAYER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        playerId: true,
      },
      orderBy: { email: 'asc' }
    })

    if (players.length === 0) {
      console.log('❌ No player accounts found in the database.\n')
      console.log('📝 To create a player account:')
      console.log('   1. Players can register at: http://localhost:3000/player/register')
      console.log('   2. Or admins can create player accounts through the dashboard\n')
      return
    }

    console.log(`✅ Found ${players.length} player account(s):\n`)
    
    players.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name || 'No name'}`)
      console.log(`   Email: ${player.email}`)
      console.log(`   Status: ${player.status}`)
      console.log(`   Player ID: ${player.playerId || 'Not linked'}`)
      console.log('')
    })

    console.log('📝 Note: Players set their own password when they register.')
    console.log('   If a player forgot their password, they need to:')
    console.log('   1. Register again (if account is PENDING)')
    console.log('   2. Contact an admin to reset their password\n')
    
    console.log('🔑 Admin can also login to player portal with:')
    console.log('   Email: admin@example.com')
    console.log('   Password: admin123\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()


