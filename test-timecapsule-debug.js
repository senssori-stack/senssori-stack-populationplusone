// Debug script for Time Capsule data
const { getHistoricalSnapshotForDate } = require('./src/data/utils/historical-snapshot');
const { getExtendedHistoricalData } = require('./src/data/utils/extended-historical-data');

async function test() {
  const testDate = '2024-12-27';
  const targetYear = new Date(testDate).getFullYear();
  
  console.log('Testing historical data for:', testDate);
  console.log('Target year:', targetYear);
  console.log('');
  
  // Test the getHistoricalSnapshotForDate function
  console.log('=== getHistoricalSnapshotForDate results ===');
  const historicalData = getHistoricalSnapshotForDate(testDate);
  console.log('Keys found:', Object.keys(historicalData).length);
  Object.entries(historicalData).forEach(([k, v]) => console.log('  ' + k + ': ' + v));
  console.log('');
  
  // Test extended historical data
  console.log('=== getExtendedHistoricalData results ===');
  const extendedData = getExtendedHistoricalData(targetYear);
  console.log('Keys found:', Object.keys(extendedData).length);
  Object.entries(extendedData).forEach(([k, v]) => console.log('  ' + k + ': ' + v));
  
  console.log('');
  console.log('Expected keys for Time Capsule:');
  const expectedKeys = [
    'GALLON OF GASOLINE',
    'LOAF OF BREAD',
    'DOZEN EGGS',
    'GALLON OF MILK',
    'GOLD OZ',
    'SILVER OZ',
    'BITCOIN 1 BTC',
    '#1 SONG',
    '#1 MOVIE',
    'WON LAST SUPERBOWL',
    'WON LAST WORLD SERIES',
    'US POPULATION',
    'WORLD POPULATION',
    'PRESIDENT',
    'VICE PRESIDENT',
  ];
  
  console.log('');
  console.log('Checking for missing data:');
  expectedKeys.forEach(key => {
    const inHistorical = historicalData[key] || '';
    const inExtended = extendedData[key] || '';
    const status = inHistorical || inExtended ? '✓' : '✗ MISSING';
    console.log('  ' + key + ': ' + status + ' (hist: "' + inHistorical + '", ext: "' + inExtended + '")');
  });
}

test().catch(console.error);
