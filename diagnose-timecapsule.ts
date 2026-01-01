// Diagnostic tool to check TimeCapsule data sources
import { getSnapshotWithHistorical } from './src/data/utils/historical-snapshot';
import { getAllSnapshotValues } from './src/data/utils/snapshot';

async function diagnoseTimeCapsuleData() {
  console.log('=== TIMECAPSULE DATA DIAGNOSTIC ===\n');
  
  // Test what data is coming from different sources
  console.log('--- Current/Live Data (Google Sheets) ---');
  try {
    const currentData = await getAllSnapshotValues();
    console.log('Available keys:', Object.keys(currentData));
    console.log('Sample current data:');
    console.log('Gas:', currentData['GALLON OF GASOLINE']);
    console.log('Bread:', currentData['LOAF OF BREAD']);
    console.log('President:', currentData['PRESIDENT']);
    console.log('Population:', currentData['US POPULATION']);
    console.log('Bitcoin:', currentData['BITCOIN 1 BTC']);
    console.log('World Series:', currentData['WON LAST WORLD SERIES']);
  } catch (error) {
    console.log('Error loading current data:', error);
  }
  
  console.log('\n--- Historical Data for Recent Birth (2023) ---');
  try {
    const data2023 = await getSnapshotWithHistorical('2023-06-15');
    console.log('Gas 2023:', data2023['GALLON OF GASOLINE']);
    console.log('President 2023:', data2023['PRESIDENT']);
    console.log('Bitcoin 2023:', data2023['BITCOIN 1 BTC']);
    console.log('World Series 2023:', data2023['WON LAST WORLD SERIES']);
  } catch (error) {
    console.log('Error loading 2023 data:', error);
  }
  
  console.log('\n--- Historical Data for 2020 Birth (Monthly) ---');
  try {
    const data2020 = await getSnapshotWithHistorical('2020-03-15');
    console.log('Gas March 2020:', data2020['GALLON OF GASOLINE']);
    console.log('President 2020:', data2020['PRESIDENT']);
    console.log('Bitcoin March 2020:', data2020['BITCOIN 1 BTC']);
  } catch (error) {
    console.log('Error loading 2020 data:', error);
  }
  
  console.log('\n--- Historical Data for Old Birth (1950) ---');
  try {
    const data1950 = await getSnapshotWithHistorical('1950-08-20');
    console.log('Gas 1950:', data1950['GALLON OF GASOLINE']);
    console.log('President 1950:', data1950['PRESIDENT']);
    console.log('Population 1950:', data1950['US POPULATION']);
    console.log('World Series 1950:', data1950['WON LAST WORLD SERIES']);
  } catch (error) {
    console.log('Error loading 1950 data:', error);
  }
}

diagnoseTimeCapsuleData().catch(console.error);