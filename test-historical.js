// Quick test of the historical data system
const { getSnapshotWithHistorical } = require('./src/data/utils/historical-snapshot.ts');

async function testHistoricalData() {
  console.log('Testing Historical Data System...\n');
  
  // Test with a date in 2023 (should get 2023 data)
  console.log('=== Testing 2023 Birth Date ===');
  const data2023 = await getSnapshotWithHistorical('2023-06-15');
  console.log('Gas Price:', data2023['gas']);
  console.log('Bread Price:', data2023['bread']);
  console.log('US President:', data2023['president']);
  console.log('Bitcoin Price:', data2023['bitcoin']);
  
  // Test with a date in 2020 (should get monthly data)
  console.log('\n=== Testing 2020 Birth Date (Monthly Data) ===');
  const data2020 = await getSnapshotWithHistorical('2020-03-15');
  console.log('Gas Price:', data2020['gas']);
  console.log('Bread Price:', data2020['bread']);
  console.log('US President:', data2020['president']);
  console.log('Bitcoin Price:', data2020['bitcoin']);
  
  // Test with a date in 2019 (should get yearly average)
  console.log('\n=== Testing 2019 Birth Date (Yearly Average) ===');
  const data2019 = await getSnapshotWithHistorical('2019-08-20');
  console.log('Gas Price:', data2019['gas']);
  console.log('Bread Price:', data2019['bread']);
  console.log('US President:', data2019['president']);
  console.log('Bitcoin Price:', data2019['bitcoin']);
  
  console.log('\n✅ Historical data system test completed!');
}

testHistoricalData().catch(console.error);