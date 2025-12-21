require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'superuser@example.com'
  const password = 'superuser123'
  
  try {
    console.log('Testing login flow...\n')
    
    // Step 1: Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.error('❌ User not found!')
      return
    }
    
    console.log('✅ User found:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Role type: ${typeof user.role}`)
    
    // Step 2: Check if role is valid
    const validRoles = ['SUPER_USER', 'ADMIN', 'COACH', 'VIEWER']
    if (!validRoles.includes(user.role)) {
      console.error(`❌ Invalid role: ${user.role}`)
      console.error(`   Valid roles: ${validRoles.join(', ')}`)
      return
    }
    
    console.log('✅ Role is valid')
    
    // Step 3: Verify password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      console.error('❌ Password is invalid!')
      return
    }
    
    console.log('✅ Password is valid')
    
    // Step 4: Check what authorize function would return
    const authResult = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.teamId,
    }
    
    console.log('\n✅ Authentication would succeed!')
    console.log('Auth result:', JSON.stringify(authResult, null, 2))
    
    // Check if there's an issue with the role enum
    console.log('\nChecking database enum...')
    const result = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"Role"))::text AS role;
    `
    console.log('Available roles in database:', result)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message?.includes('SUPER_USER')) {
      console.error('\n⚠️  The SUPER_USER role might not exist in the database enum!')
      console.error('Try running: npx prisma db push --accept-data-loss')
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())





