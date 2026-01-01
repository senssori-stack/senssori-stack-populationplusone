// Debug test to see what historical data is actually available
import { getSnapshotWithHistorical } from './src/data/utils/historical-snapshot';

async function debugHistoricalData() {
  console.log('=== DEBUG: Historical Data Availability ===\n');
  
  // Test 2023 data
  console.log('--- 2023 Data Debug ---');
  const data2023 = await getSnapshotWithHistorical('2023-06-15');
  console.log('Available keys:', Object.keys(data2023));
  console.log('Total keys:', Object.keys(data2023).length);
  
  // Show first 10 key-value pairs
  const entries2023 = Object.entries(data2023).slice(0, 15);
  entries2023.forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  
  console.log('\n--- 1950 Data Debug ---');
  const data1950 = await getSnapshotWithHistorical('1950-08-20');
  console.log('Available keys:', Object.keys(data1950));
  console.log('Total keys:', Object.keys(data1950).length);
  
  // Show first 10 key-value pairs
  const entries1950 = Object.entries(data1950).slice(0, 15);
  entries1950.forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
}

debugHistoricalData().catch(console.error);