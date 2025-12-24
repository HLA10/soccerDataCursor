require('dotenv').config()
const { Client } = require('pg')
const bcrypt = require('bcryptjs')

async function main() {
  const email = 'admin@example.com'
  const password = 'admin123456'
  const name = 'Admin User'

  console.log('🔐 Resetting admin password using SQL...')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log('')

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set!')
    process.exit(1)
  }

  const dbUrl = process.env.DATABASE_URL
  console.log('🔗 Connecting to database...')
  console.log(`   ${dbUrl.replace(/:[^:@]+@/, ':****@')}`) // Hide password
  console.log('')

  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    await client.connect()
    console.log('✅ Connected to database!')
    console.log('')

    // Hash the password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('✅ Password hashed')
    console.log('')

    // Check if user exists
    console.log('🔍 Checking if user exists...')
    const checkResult = await client.query(
      'SELECT id, email, role, status FROM users WHERE email = $1',
      [email]
    )

    if (checkResult.rows.length > 0) {
      const user = checkResult.rows[0]
      console.log('✅ User found!')
      console.log(`   ID: ${user.id}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Status: ${user.status}`)
      console.log('')
      console.log('🔄 Updating password...')

      await client.query(
        `UPDATE users 
         SET password = $1, name = $2, role = $3, status = $4 
         WHERE email = $5`,
        [hashedPassword, name, 'ADMIN', 'ACTIVE', email]
      )

      console.log('✅ Password updated successfully!')
    } else {
      console.log('❌ User not found! Creating new admin user...')

      const userId = require('crypto').randomUUID()
      await client.query(
        `INSERT INTO users (id, email, password, name, role, status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [userId, email, hashedPassword, name, 'ADMIN', 'ACTIVE']
      )

      console.log('✅ Admin user created successfully!')
      console.log(`   ID: ${userId}`)
    }

    console.log('')
    console.log('✅ Admin user is ready!')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('')
    console.log('You can now log in to your Vercel deployment!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === 'ECONNREFUSED') {
      console.error('')
      console.error('Database connection refused!')
      console.error('Make sure DATABASE_URL is correct and the database is accessible.')
    } else if (error.code === '42P01') {
      console.error('')
      console.error('Table does not exist!')
      console.error('Make sure migrations have been run on the database.')
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

