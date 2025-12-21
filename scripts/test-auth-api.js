require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Simulate the authorize function from lib/auth.ts
async function testAuthorize() {
  const email = 'superuser@example.com'
  const password = 'superuser123'
  
  console.log('Testing NextAuth authorize function...\n')
  
  if (!email || !password) {
    console.error('❌ Email or password missing')
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.error('❌ User not found')
    return null
  }

  console.log('✅ User found:', user.email)
  console.log('   Role:', user.role)

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    console.error('❌ Password invalid')
    return null
  }

  console.log('✅ Password valid')

  const result = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    teamId: user.teamId,
  }

  console.log('\n✅ Authorize would return:')
  console.log(JSON.stringify(result, null, 2))
  
  return result
}

testAuthorize()
  .then(() => {
    console.log('\n✅ All checks passed! Login should work.')
    console.log('\nTry logging in with:')
    console.log('   Email: superuser@example.com')
    console.log('   Password: superuser123')
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect())





