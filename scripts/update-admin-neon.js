require('dotenv').config()
const { Client } = require('pg')
const bcrypt = require('bcryptjs')

const DATABASE_URL = process.env.DATABASE_URL || process.argv[2]

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is required')
  console.error('Usage: node update-admin-neon.js <DATABASE_URL>')
  process.exit(1)
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function main() {
  try {
    await client.connect()
    console.log('✅ Connected to Neon database')

    const email = 'admin@example.com'
    const password = 'admin123456'

    // Generate password hash
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('✅ Generated password hash')

    // Check if user exists
    const checkResult = await client.query(
      'SELECT id, email, role, status FROM users WHERE email = $1',
      [email]
    )

    if (checkResult.rows.length === 0) {
      // Create user
      console.log('Creating new admin user...')
      const result = await client.query(
        `INSERT INTO users (id, email, password, name, role, status, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, email, name, role, status`,
        [email, hashedPassword, 'Admin User', 'ADMIN', 'ACTIVE']
      )
      console.log('✅ Admin user created!')
      console.log('User:', result.rows[0])
    } else {
      // Update password
      console.log('Updating existing admin user password...')
      const result = await client.query(
        `UPDATE users 
         SET password = $1, status = $2, "updatedAt" = NOW()
         WHERE email = $3
         RETURNING id, email, name, role, status`,
        [hashedPassword, 'ACTIVE', email]
      )
      console.log('✅ Admin user password updated!')
      console.log('User:', result.rows[0])
    }

    // Verify password
    const verifyResult = await client.query(
      'SELECT password FROM users WHERE email = $1',
      [email]
    )
    const storedHash = verifyResult.rows[0].password
    const isValid = await bcrypt.compare(password, storedHash)
    console.log(`Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`)

    console.log('')
    console.log('========================================')
    console.log('✅ Admin User Ready!')
    console.log('========================================')
    console.log('')
    console.log('Login credentials:')
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()


