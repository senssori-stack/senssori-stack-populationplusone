// Diagnostic script to compare historical data sources
// Run with: node diagnose-data.js

// Since we're using ESM modules, we need to use dynamic import
async function run() {
  // Import the data sources
  const extendedModule = await import('./src/data/utils/extended-historical-data.ts');
  const comprehensiveModule = await import('./src/data/utils/comprehensive-historical-data.ts');
  
  const getExtendedHistoricalData = extendedModule.getExtendedHistoricalData;
  const getComprehensiveHistoricalData = comprehensiveModule.getComprehensiveHistoricalData;
  const COMPREHENSIVE = comprehensiveModule.COMPREHENSIVE_HISTORICAL_DATA;
  
  // Test several years
  const testYears = [1960, 1970, 1980, 1990, 2000, 2010, 2020];
  
  console.log('=== DATA COMPARISON FOR KEY YEARS ===\n');
  
  for (const year of testYears) {
    const extended = getExtendedHistoricalData(year);
    const comprehensive = getComprehensiveHistoricalData(year);
    
    console.log(`Year: ${year}`);
    console.log(`  US Pop (Extended):       ${extended['US POPULATION']}`);
    console.log(`  US Pop (Comprehensive):  ${comprehensive['US POPULATION']}`);
    console.log(`  US Pop (Direct lookup):  ${COMPREHENSIVE.usPopulation[year]}`);
    console.log(`  World Pop (Extended):    ${extended['WORLD POPULATION']}`);
    console.log(`  World Pop (Comprehensive): ${comprehensive['WORLD POPULATION']}`);
    console.log(`  Gas (Extended):          ${extended['GALLON OF GASOLINE']}`);
    console.log(`  Bread (Extended):        ${extended['LOAF OF BREAD']}`);
    console.log(`  Bread (Comprehensive):   ${comprehensive['LOAF OF BREAD']}`);
    console.log('');
  }
  
  // Check for Super Bowl data accuracy (should be N/A before 1967)
  console.log('=== SUPER BOWL DATA CHECK ===');
  for (const year of [1966, 1967, 1970, 1980]) {
    console.log(`${year}: ${COMPREHENSIVE.superBowlWinners[year] || 'N/A (no data)'}`);
  }
}

run().catch(console.error);
