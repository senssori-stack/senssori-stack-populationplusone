// Quick test of the historical data system
import { getSnapshotWithHistorical } from './src/data/utils/historical-snapshot';

async function testHistoricalData() {
  console.log('Testing Historical Data System (1914-2025)...\n');
  
  // Test with a date in 2023 (should get 2023 data)
  console.log('=== Testing 2023 Birth Date ===');
  const data2023 = await getSnapshotWithHistorical('2023-06-15');
  console.log('Gas Price:', data2023['GALLON OF GASOLINE']);
  console.log('Bread Price:', data2023['LOAF OF BREAD']);
  console.log('US President:', data2023['PRESIDENT']);
  console.log('Bitcoin Price:', data2023['BITCOIN 1 BTC']);
  
  // Test with a date in 2020 (should get monthly data)
  console.log('\n=== Testing 2020 Birth Date (Monthly Data) ===');
  const data2020 = await getSnapshotWithHistorical('2020-03-15');
  console.log('Gas Price:', data2020['GALLON OF GASOLINE']);
  console.log('Bread Price:', data2020['LOAF OF BREAD']);
  console.log('US President:', data2020['PRESIDENT']);
  console.log('Bitcoin Price:', data2020['BITCOIN 1 BTC']);
  
  // Test with a date in 1950 (should get extended historical data)
  console.log('\n=== Testing 1950 Birth Date (Extended Historical) ===');
  const data1950 = await getSnapshotWithHistorical('1950-08-20');
  console.log('US President:', data1950['PRESIDENT']);
  console.log('Population:', data1950['US POPULATION']);
  console.log('Gold Price:', data1950['GOLD OZ']);
  console.log('World Series:', data1950['WON LAST WORLD SERIES']);
  console.log('#1 Song:', data1950['#1 SONG']);
  console.log('Gas Price:', data1950['GALLON OF GASOLINE']);
  console.log('Bread Price:', data1950['LOAF OF BREAD']);
  
  // Test with a date in 1920 (should get extended historical data)
  console.log('\n=== Testing 1920 Birth Date (Extended Historical) ===');
  const data1920 = await getSnapshotWithHistorical('1920-05-15');
  console.log('US President:', data1920['PRESIDENT']);
  console.log('Population:', data1920['US POPULATION']);
  console.log('Gold Price:', data1920['GOLD OZ']);
  console.log('World Series:', data1920['WON LAST WORLD SERIES']);
  console.log('#1 Song:', data1920['#1 SONG']);
  console.log('Gas Price:', data1920['GALLON OF GASOLINE']);
  console.log('Bread Price:', data1920['LOAF OF BREAD']);
  
  // Test with oldest possible American (1914)
  console.log('\n=== Testing 1914 Birth Date (Oldest Americans Alive) ===');
  const data1914 = await getSnapshotWithHistorical('1914-12-31');
  console.log('US President:', data1914['PRESIDENT']);
  console.log('Population:', data1914['US POPULATION']);
  console.log('Gold Price:', data1914['GOLD OZ']);
  console.log('World Series:', data1914['WON LAST WORLD SERIES']);
  console.log('#1 Song:', data1914['#1 SONG']);
  console.log('Gas Price:', data1914['GALLON OF GASOLINE']);
  console.log('Bread Price:', data1914['LOAF OF BREAD']);
  
  console.log('\n✅ Extended historical data system test completed!');
  console.log('🎯 Now covers births from 1914 (oldest Americans alive) to 2025!');
}

testHistoricalData().catch(console.error);