require('dotenv').config()
const { Client } = require('pg')

async function main() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_3OEzI4MpaCTy@ep-orange-wildflower-agvaohm3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  
  console.log('🔍 Checking admin user in database...')
  console.log('')

  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')
    console.log('')

    const result = await client.query(
      'SELECT id, email, role, status, LEFT(password, 30) as password_preview FROM users WHERE email = $1',
      ['admin@example.com']
    )

    if (result.rows.length > 0) {
      const user = result.rows[0]
      console.log('✅ Admin user found!')
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Status: ${user.status}`)
      console.log(`   Password hash: ${user.password_preview}...`)
      console.log('')
      console.log('✅ User exists and is ACTIVE')
    } else {
      console.log('❌ Admin user NOT found in database!')
      console.log('')
      console.log('We need to create it. Run:')
      console.log('   node scripts/reset-admin-sql.js')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === '42P01') {
      console.error('')
      console.error('Table does not exist!')
      console.error('Migrations may not have run.')
    }
  } finally {
    await client.end()
  }
}

main()

