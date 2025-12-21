const http = require('http')

console.log('Checking if server is running on http://localhost:3000...')

const req = http.get('http://localhost:3000', (res) => {
  console.log(`✅ Server is running! Status: ${res.statusCode}`)
  process.exit(0)
})

req.on('error', (error) => {
  console.log('❌ Server is NOT running')
  console.log('Error:', error.message)
  process.exit(1)
})

req.setTimeout(5000, () => {
  req.destroy()
  console.log('❌ Server check timed out - server is likely not running')
  process.exit(1)
})





