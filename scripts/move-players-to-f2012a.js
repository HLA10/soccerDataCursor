const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  try {
    // Find the F2012-A team
    const team = await prisma.team.findFirst({
      where: {
        name: {
          contains: "F2012-A",
          mode: "insensitive",
        },
      },
    })

    if (!team) {
      console.error("F2012-A team not found")
      process.exit(1)
    }

    console.log(`Found team: ${team.name} (ID: ${team.id})`)

    // Player names to move (allowing for slight variations)
    const playerNames = [
      "Stella Van Heer",
      "Isabella Lind",
      "Isablla Lind", // Typo variant
      "Olivia Hautala",
    ]

    // Find all players with these names
    const players = await prisma.player.findMany({
      where: {
        OR: playerNames.map((name) => ({
          name: {
            contains: name,
            mode: "insensitive",
          },
        })),
      },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    })

    console.log(`Found ${players.length} players to move:`)
    players.forEach((p) => {
      console.log(`  - ${p.name} (ID: ${p.id})`)
      console.log(`    Current teams: ${p.teams.map((t) => t.team.name).join(", ")}`)
    })

    // Move each player to F2012-A
    for (const player of players) {
      // Check if player is already on this team
      const existingTeamPlayer = await prisma.teamPlayer.findFirst({
        where: {
          playerId: player.id,
          teamId: team.id,
        },
      })

      if (existingTeamPlayer) {
        console.log(`  ✓ ${player.name} is already on ${team.name}`)
        continue
      }

      // Remove from all current teams first
      await prisma.teamPlayer.deleteMany({
        where: {
          playerId: player.id,
        },
      })

      // Add to F2012-A
      await prisma.teamPlayer.create({
        data: {
          playerId: player.id,
          teamId: team.id,
        },
      })

      // Update primary team
      await prisma.player.update({
        where: {
          id: player.id,
        },
        data: {
          primaryTeamId: team.id,
        },
      })

      console.log(`  ✓ Moved ${player.name} to ${team.name}`)
    }

    console.log("\n✅ All players moved successfully!")
  } catch (error) {
    console.error("Error moving players:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()



