/**
 * Test script for Census API population lookups
 * 
 * Run with: npx ts-node test-census-api.ts
 * 
 * Tests the Census Bureau API integration for historical city populations.
 * The API provides data for:
 * - 2020, 2010, 2000 decennial census (direct data)
 * - 2010-2023 via Population Estimates Program
 * - Pre-1990: NO API DATA AVAILABLE (must use local files)
 */

import { getCensusHistoricalPopulation, clearCensusCache } from './src/data/utils/census-api';
import { getHistoricalCityPopulation, getPopulationWithHistoricalContext } from './src/data/utils/historical-city-populations';

async function testCensusAPI() {
  console.log('='.repeat(60));
  console.log('CENSUS API TEST - Historical City Population Lookup');
  console.log('='.repeat(60));
  
  // Clear cache for fresh results
  clearCensusCache();
  
  // Test cities - mix of large, medium, and small
  const testCases = [
    // Large cities (should work)
    { city: 'Springfield, MO', year: 2020 },
    { city: 'Springfield, MO', year: 2010 },
    { city: 'Springfield, MO', year: 1950 }, // Pre-1990, should use local data
    { city: 'New York, NY', year: 2020 },
    { city: 'Los Angeles, CA', year: 2000 },
    
    // Smaller cities - test if API can find them
    { city: 'Branson, MO', year: 2020 },
    { city: 'Joplin, MO', year: 2010 },
    { city: 'Cape Girardeau, MO', year: 2020 },
    
    // Test interpolation (between census years)
    { city: 'Chicago, IL', year: 2015 },
    { city: 'Dallas, TX', year: 2005 },
    
    // Pre-1990 (should fall back to local data or return null)
    { city: 'Kansas City, MO', year: 1970 },
    { city: 'St. Louis, MO', year: 1930 },
  ];
  
  console.log('\n--- Testing Direct Census API ---\n');
  
  for (const { city, year } of testCases) {
    console.log(`\nLooking up: ${city} (${year})`);
    
    // First check local data
    const localPop = getHistoricalCityPopulation(city, year);
    console.log(`  Local data: ${localPop ? localPop.toLocaleString() : 'NOT FOUND'}`);
    
    // Then check Census API (only works for 1990+)
    if (year >= 1990) {
      const apiResult = await getCensusHistoricalPopulation(city, year);
      console.log(`  Census API: ${apiResult.population ? apiResult.population.toLocaleString() : 'NOT FOUND'} (source: ${apiResult.source})`);
    } else {
      console.log(`  Census API: SKIPPED (pre-1990, no API data available)`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('--- Testing Combined Lookup (getPopulationWithHistoricalContext) ---');
  console.log('='.repeat(60) + '\n');
  
  // Test the combined function that tries local data first, then API
  const combinedTests = [
    { city: 'Springfield, MO', year: 1950 },
    { city: 'Branson, MO', year: 2020 },  // Small city, likely not in local data
    { city: 'Phoenix, AZ', year: 1960 },
  ];
  
  for (const { city, year } of combinedTests) {
    console.log(`\nCombined lookup: ${city} (${year})`);
    const result = await getPopulationWithHistoricalContext(city, year);
    console.log(`  Population: ${result.population ? result.population.toLocaleString() : 'NOT FOUND'}`);
    console.log(`  Source: ${result.source}`);
    console.log(`  Is Estimated: ${result.isEstimated || false}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60));
}

testCensusAPI().catch(console.error);
