// Test date matching logic
const testDate = new Date('2025-01-15')
const gameDate1 = new Date('2025-01-15T10:00:00Z')
const gameDate2 = '2025-01-15T10:00:00Z'
const gameDate3 = '2025-01-15'

console.log('Test Date:', testDate.toISOString())
console.log('Game Date 1 (Date object):', gameDate1.toISOString())
console.log('Game Date 2 (ISO string):', gameDate2)
console.log('Game Date 3 (Date string):', gameDate3)

// Normalize dates
testDate.setHours(0, 0, 0, 0)
gameDate1.setHours(0, 0, 0, 0)

console.log('\nAfter normalization:')
console.log('Test Date:', testDate.toISOString())
console.log('Game Date 1:', gameDate1.toISOString())

// Test comparison
const date2 = new Date(gameDate2)
date2.setHours(0, 0, 0, 0)
console.log('Game Date 2 (parsed):', date2.toISOString())

const date3 = new Date(gameDate3)
date3.setHours(0, 0, 0, 0)
console.log('Game Date 3 (parsed):', date3.toISOString())

console.log('\nComparisons:')
console.log('Date1 matches:', testDate.getTime() === gameDate1.getTime())
console.log('Date2 matches:', testDate.getTime() === date2.getTime())
console.log('Date3 matches:', testDate.getTime() === date3.getTime())





