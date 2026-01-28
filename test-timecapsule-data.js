// Test that all TimeCapsule data fields are populating correctly
// Run with: npx ts-node test-timecapsule-data.js

const EXPECTED_KEYS = [
  'GALLON OF GASOLINE',
  'LOAF OF BREAD',
  'DOZEN EGGS',
  'GALLON OF MILK',
  'ELECTRICITY KWH',
  'GOLD OZ',
  'SILVER OZ',
  'BITCOIN 1 BTC',
  'WON LAST SUPERBOWL',
  'WON LAST WORLD SERIES',
  '#1 SONG',
  'US POPULATION',
  'WORLD POPULATION',
  'PRESIDENT',
  'VICE PRESIDENT',
];

async function testData(birthDate) {
  console.log(`\n===== Testing data for birth date: ${birthDate} =====\n`);
  
  try {
    const { getSnapshotWithHistorical } = require('./src/data/utils/historical-snapshot');
    const { formatSnapshotValue } = require('./src/data/utils/formatSnapshot');
    
    const data = await getSnapshotWithHistorical(birthDate);
    
    console.log('All keys in returned data:', Object.keys(data).length);
    console.log('');
    
    let missingCount = 0;
    let foundCount = 0;
    
    for (const key of EXPECTED_KEYS) {
      const raw = data[key];
      const formatted = formatSnapshotValue(key, raw);
      
      if (raw) {
        console.log(`✅ ${key}: "${raw}" → "${formatted}"`);
        foundCount++;
      } else {
        console.log(`❌ ${key}: MISSING`);
        missingCount++;
      }
    }
    
    console.log(`\n----- Summary for ${birthDate} -----`);
    console.log(`Found: ${foundCount}/${EXPECTED_KEYS.length}`);
    console.log(`Missing: ${missingCount}/${EXPECTED_KEYS.length}`);
    
    return { found: foundCount, missing: missingCount };
  } catch (error) {
    console.error('Error:', error.message);
    return { found: 0, missing: EXPECTED_KEYS.length, error: error.message };
  }
}

async function runTests() {
  console.log('TimeCapsule Data Validation Test');
  console.log('================================\n');
  
  const testDates = [
    '2024-06-15',  // Recent date (should have monthly data)
    '2020-03-20',  // Pandemic era (monthly data)
    '2015-08-10',  // Pre-2020 (yearly data)
    '2000-01-01',  // Y2K (extended historical)
    '1985-07-04',  // 1980s (extended historical)
    '1971-05-15',  // 1971 (special boundary case)
    '1950-12-25',  // Mid-century (extended historical)
  ];
  
  const results = {};
  
  for (const date of testDates) {
    results[date] = await testData(date);
  }
  
  console.log('\n========== OVERALL SUMMARY ==========\n');
  for (const [date, result] of Object.entries(results)) {
    const status = result.missing === 0 ? '✅ PASS' : `⚠️ ${result.missing} missing`;
    console.log(`${date}: ${status}`);
  }
}

runTests().catch(console.error);
