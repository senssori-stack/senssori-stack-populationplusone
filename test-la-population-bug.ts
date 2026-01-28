// Debug script to test LA population lookup issue
import { getPopulationWithHistoricalContext } from './src/data/utils/historical-city-populations';
import { getPopulationForCity } from './src/data/utils/populations';

async function test() {
  console.log('\n=== TEST 1: Los Angeles, California ===');
  const result1 = await getPopulationWithHistoricalContext('Los Angeles, California', 2024);
  console.log('Result:', result1);
  
  console.log('\n=== TEST 2: Los Angeles, CA ===');
  const result2 = await getPopulationWithHistoricalContext('Los Angeles, CA', 2024);
  console.log('Result:', result2);
  
  console.log('\n=== TEST 3: Los Angeles CA (no comma) ===');
  const result3 = await getPopulationWithHistoricalContext('Los Angeles CA', 2024);
  console.log('Result:', result3);
  
  console.log('\n=== TEST 4: Current population LA ===');
  const result4 = await getPopulationForCity('Los Angeles, California');
  console.log('Result:', result4);
  
  console.log('\n=== TEST 5: Current population LA with abbrev ===');
  const result5 = await getPopulationForCity('Los Angeles, CA');
  console.log('Result:', result5);
  
  console.log('\n=== TEST 6: Historical 2020 ===');
  const result6 = await getPopulationWithHistoricalContext('Los Angeles, California', 2020);
  console.log('Result:', result6);
  
  console.log('\n=== TEST 7: Historical 1950 ===');
  const result7 = await getPopulationWithHistoricalContext('Los Angeles, California', 1950);
  console.log('Result:', result7);
}

test().catch(console.error);
