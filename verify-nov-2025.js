#!/usr/bin/env node
/**
 * Quick verification that November 2025 snapshot data is present
 */

const { HISTORICAL_SNAPSHOT_DATA } = require('./src/data/utils/historical-snapshot');

console.log('=== Checking for 2025-11 (November) data in HISTORICAL_SNAPSHOT_DATA ===\n');

const fieldsToCheck = [
  '#1 SONG',
  'WON LAST SUPERBOWL',
  'WON LAST WORLD SERIES',
  'GOLD OZ',
  'SILVER OZ',
  'BITCOIN',
  'GALLON OF GASOLINE',
  'LOAF OF BREAD',
  'US POPULATION',
  'WORLD POPULATION'
];

for (const field of fieldsToCheck) {
  const item = HISTORICAL_SNAPSHOT_DATA.find(d => d.key === field);
  
  if (!item) {
    console.log(`✗ ${field}: NOT FOUND IN SNAPSHOT DATA`);
    continue;
  }
  
  if (item.monthlyData) {
    const nov2025 = item.monthlyData.find(d => d.date === '2025-11');
    if (nov2025) {
      console.log(`✓ ${field}: ${nov2025.value}`);
    } else {
      console.log(`✗ ${field}: No 2025-11 entry in monthlyData`);
      console.log(`    Available months for 2025: ${item.monthlyData.filter(d => d.date.startsWith('2025')).map(d => d.date).join(', ')}`);
    }
  } else if (item.yearlyData) {
    const year2025 = item.yearlyData.find(d => d.date === '2025');
    if (year2025) {
      console.log(`✓ ${field} (yearly): ${year2025.value}`);
    } else {
      console.log(`✗ ${field}: No 2025 entry in yearlyData`);
    }
  } else {
    console.log(`? ${field}: No monthlyData or yearlyData found`);
  }
}

console.log('\n=== Test getHistoricalSnapshotForDate function ===\n');

// Import and test the actual function
const { getHistoricalSnapshotForDate } = require('./src/data/utils/historical-snapshot');

const result = getHistoricalSnapshotForDate('2025-11-10');

console.log('Result for 2025-11-10:');
Object.entries(result).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});
