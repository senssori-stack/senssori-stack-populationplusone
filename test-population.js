// Test historical population lookup
const { getSnapshotWithHistorical } = require('./src/data/utils/historical-snapshot');

async function testHistoricalPopulation() {
  try {
    console.log('Testing historical population lookup...\n');
    
    // Test 1971 date
    const data1971 = await getSnapshotWithHistorical('1971-05-15');
    console.log('1971 snapshot keys:', Object.keys(data1971));
    console.log('1971 World Population:', data1971['WORLD POPULATION']);
    
    // Test recent date
    const data2023 = await getSnapshotWithHistorical('2023-05-15');
    console.log('\n2023 snapshot keys:', Object.keys(data2023));
    console.log('2023 World Population:', data2023['WORLD POPULATION']);
    
    console.log('\n✅ Historical population lookup test complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testHistoricalPopulation();