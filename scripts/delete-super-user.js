require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = 'superuser@example.com'
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      await prisma.user.delete({
        where: { email }
      })
      console.log('✅ SUPER_USER deleted successfully!')
    } else {
      console.log('ℹ️  SUPER_USER not found (already deleted)')
    }
  } catch (error) {
    console.error('Error deleting user:', error.message)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())





