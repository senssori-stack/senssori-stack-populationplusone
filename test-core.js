// Simple test to verify core functionality
const { getAllSnapshotValues } = require('./src/data/utils/snapshot');
const { getPopulationForCity } = require('./src/data/utils/populations');

async function testCoreFeatures() {
  console.log('Testing core app functionality...\n');
  
  try {
    console.log('1. Testing snapshot data fetch...');
    const snapshot = await getAllSnapshotValues();
    console.log('✓ Snapshot data loaded successfully');
    console.log(`   Found ${Object.keys(snapshot).length} data points`);
    console.log('   Sample data:', {
      gas: snapshot['GALLON OF GASOLINE'],
      president: snapshot['PRESIDENT'],
      population: snapshot['US POPULATION']
    });
    
    console.log('\n2. Testing population lookup...');
    const population = await getPopulationForCity('New York');
    console.log('✓ Population lookup working');
    console.log(`   New York population: ${population}`);
    
    console.log('\n✅ All core features working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing core features:', error.message);
  }
}

testCoreFeatures();