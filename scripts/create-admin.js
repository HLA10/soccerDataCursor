require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { randomUUID } = require('crypto')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'admin@example.com'
  const password = process.argv[3] || 'admin123'
  const name = process.argv[4] || 'Admin User'

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    // First, try to find existing user
    const existingUser = await prisma.users.findUnique({
      where: { email },
    })

    let user
    if (existingUser) {
      // Update existing user
      user = await prisma.users.update({
        where: { email },
        data: {
          password: hashedPassword,
          name,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      })
      console.log('Admin user updated successfully!')
    } else {
      // Create new user
      user = await prisma.users.create({
        data: {
          id: randomUUID(),
          email,
          password: hashedPassword,
          name,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      })
      console.log('Admin user created successfully!')
    }

    console.log('Admin user created/updated successfully!')
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.name}`)
    console.log(`Role: ${user.role}`)
  } catch (error) {
    console.error('Error creating admin user:', error)
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

