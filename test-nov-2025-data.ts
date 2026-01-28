import { getSnapshotWithHistorical } from './src/data/utils/historical-snapshot';

async function testNov2025() {
  console.log('Testing November 10, 2025 data...\n');
  
  try {
    // Test with Nov 10, 2025 - ISO format
    const snapshot = await getSnapshotWithHistorical('2025-11-10');
    
    console.log('=== HISTORICAL SNAPSHOT FOR NOV 10, 2025 ===\n');
    
    // Check key fields that were reported as wrong
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
      const value = snapshot[field];
      if (value) {
        console.log(`✓ ${field}: ${value}`);
      } else {
        console.log(`✗ ${field}: MISSING`);
      }
    }
    
    console.log('\n=== FULL SNAPSHOT DATA ===');
    console.log(JSON.stringify(snapshot, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testNov2025();
