require('dotenv').config()
const { Client } = require('pg')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

async function fixSchema() {
  try {
    await client.connect()
    console.log('✅ Connected to database')
    
    // Check current column type
    const checkResult = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'emailVerified'
    `)
    
    console.log('Current emailVerified type:', checkResult.rows[0]?.data_type)
    
    // Drop default and NOT NULL constraint first
    await client.query(`ALTER TABLE users ALTER COLUMN "emailVerified" DROP DEFAULT`)
    console.log('✅ Dropped default constraint')
    
    await client.query(`ALTER TABLE users ALTER COLUMN "emailVerified" DROP NOT NULL`)
    console.log('✅ Dropped NOT NULL constraint')
    
    // Fix the column - convert boolean to timestamp
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN "emailVerified" TYPE timestamp without time zone 
      USING CASE 
        WHEN "emailVerified"::text = 'true' THEN NOW()
        WHEN "emailVerified"::text = 'false' THEN NULL
        ELSE NULL
      END
    `)
    
    console.log('✅ Fixed emailVerified column type')
    
    // Verify
    const verifyResult = await client.query('SELECT email, "emailVerified" FROM users LIMIT 5')
    console.log('\n✅ Sample users:')
    verifyResult.rows.forEach(row => {
      console.log(`   ${row.email}: ${row.emailVerified || 'NULL'}`)
    })
    
    await client.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    await client.end()
    process.exit(1)
  }
}

fixSchema()

