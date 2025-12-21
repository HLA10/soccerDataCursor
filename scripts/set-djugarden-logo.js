require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const path = require('path')
const fs = require('fs')

const prisma = new PrismaClient()

async function setDjugardenLogo() {
  try {
    console.log('🔍 Finding all Djugarden teams...\n')

    // Find all teams matching Djugarden patterns: Djugarden, DIF, Djugården
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          {
            name: {
              contains: 'Djugarden',
              mode: 'insensitive'
            }
          },
          {
            name: {
              contains: 'Djugården',
              mode: 'insensitive'
            }
          },
          {
            name: {
              contains: 'DIF',
              mode: 'insensitive'
            }
          },
          {
            code: {
              contains: 'DIF',
              mode: 'insensitive'
            }
          }
        ]
      }
    })

    if (teams.length === 0) {
      console.log('❌ No Djugarden teams found in the database')
      return
    }

    console.log(`📋 Found ${teams.length} Djugarden team(s):`)
    teams.forEach(team => {
      console.log(`  - ${team.name} (${team.code || 'no code'}) - ID: ${team.id}`)
      if (team.logo) {
        console.log(`    Current logo: ${team.logo}`)
      }
    })

    // Logo path - update this if you place the logo in a different location
    const logoPath = '/uploads/djugarden-logo.png'
    
    // Check if file exists in public directory
    const publicLogoPath = path.join(process.cwd(), 'public', 'uploads', 'djugarden-logo.png')
    if (!fs.existsSync(publicLogoPath)) {
      console.log('\n⚠️  Warning: Logo file not found at:', publicLogoPath)
      console.log('   Please save the Djugarden logo as "djugarden-logo.png" in the public/uploads/ directory')
      console.log('   Or update the logoPath variable in this script to point to your logo location')
      console.log('\n   You can also manually set the logo URL for each team via the API or database.')
      return
    }

    console.log(`\n✅ Logo file found at: ${publicLogoPath}`)
    console.log(`\n🔄 Updating all Djugarden teams to use logo: ${logoPath}\n`)

    // Update all Djugarden teams with the logo
    let updatedCount = 0
    for (const team of teams) {
      await prisma.team.update({
        where: { id: team.id },
        data: { logo: logoPath }
      })
      console.log(`✅ Updated ${team.name} with logo`)
      updatedCount++
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} team(s) with the Djugarden logo!`)
  } catch (error) {
    console.error('❌ Error setting Djugarden logo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setDjugardenLogo()

