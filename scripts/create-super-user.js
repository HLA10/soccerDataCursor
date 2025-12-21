require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'superuser@example.com'
  const password = process.argv[3] || 'superuser123'
  const name = process.argv[4] || 'Super User'

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        name,
        role: 'SUPER_USER',
      },
      create: {
        email,
        password: hashedPassword,
        name,
        role: 'SUPER_USER',
      },
    })

    console.log('SUPER_USER created/updated successfully!')
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.name}`)
    console.log(`Role: ${user.role}`)
    console.log('\nYou can now sign in with these credentials.')
  } catch (error) {
    console.error('Error creating SUPER_USER:', error)
    if (error.message?.includes('SUPER_USER')) {
      console.error('\nNote: Make sure you have run the database migration to add SUPER_USER role:')
      console.error('npx prisma migrate dev --name add_super_user_and_invitations')
    }
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

