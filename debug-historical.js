// Debug test to see what historical data is actually available
const { getSnapshotWithHistorical } = require('./src/data/utils/historical-snapshot.ts');

async function debugHistoricalData() {
  console.log('=== DEBUG: Historical Data Availability ===\n');
  
  // Test 2023 data
  console.log('--- 2023 Data Debug ---');
  const data2023 = await getSnapshotWithHistorical('2023-06-15');
  console.log('Available keys:', Object.keys(data2023));
  console.log('Total keys:', Object.keys(data2023).length);
  
  // Show first 15 key-value pairs
  const entries2023 = Object.entries(data2023).slice(0, 15);
  entries2023.forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  
  console.log('\n--- 1950 Data Debug ---');
  const data1950 = await getSnapshotWithHistorical('1950-08-20');
  console.log('Available keys:', Object.keys(data1950));
  console.log('Total keys:', Object.keys(data1950).length);
  
  // Show first 15 key-value pairs
  const entries1950 = Object.entries(data1950).slice(0, 15);
  entries1950.forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });

  console.log('\n--- 1971 Data Debug ---');
  const data1971 = await getSnapshotWithHistorical('1971-08-20');
  console.log('Available keys:', Object.keys(data1971));
  console.log('Total keys:', Object.keys(data1971).length);
  
  // Show population specifically
  const entries1971 = Object.entries(data1971).slice(0, 15);
  entries1971.forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });

  // Look for population keys specifically
  console.log('\n--- Looking for Population Keys ---');
  const popKeys2023 = Object.keys(data2023).filter(key => key.toLowerCase().includes('pop'));
  const popKeys1971 = Object.keys(data1971).filter(key => key.toLowerCase().includes('pop'));
  
  console.log('2023 population keys:', popKeys2023);
  console.log('1971 population keys:', popKeys1971);
  
  popKeys2023.forEach(key => {
    console.log(`2023 ${key}: ${data2023[key]}`);
  });
  
  popKeys1971.forEach(key => {
    console.log(`1971 ${key}: ${data1971[key]}`);
  });
}

debugHistoricalData().catch(console.error);