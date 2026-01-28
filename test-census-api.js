/**
 * Test script for Census API population lookups
 * 
 * Run with: node test-census-api.js
 * 
 * Tests the Census Bureau API integration for historical city populations.
 */

// Simple fetch-based test without TypeScript imports

const STATE_FIPS = {
  'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06', 'CO': '08',
  'CT': '09', 'DE': '10', 'DC': '11', 'FL': '12', 'GA': '13', 'HI': '15',
  'ID': '16', 'IL': '17', 'IN': '18', 'IA': '19', 'KS': '20', 'KY': '21',
  'LA': '22', 'ME': '23', 'MD': '24', 'MA': '25', 'MI': '26', 'MN': '27',
  'MS': '28', 'MO': '29', 'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33',
  'NJ': '34', 'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38', 'OH': '39',
  'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44', 'SC': '45', 'SD': '46',
  'TN': '47', 'TX': '48', 'UT': '49', 'VT': '50', 'VA': '51', 'WA': '53',
  'WV': '54', 'WI': '55', 'WY': '56', 'PR': '72'
};

async function testCensusAPI(cityName, stateAbbr, year) {
  const stateFips = STATE_FIPS[stateAbbr];
  if (!stateFips) {
    console.log(`  Invalid state: ${stateAbbr}`);
    return null;
  }
  
  let apiUrl;
  let popField;
  
  if (year === 2020) {
    apiUrl = `https://api.census.gov/data/2020/dec/dhc?get=NAME,P1_001N&for=place:*&in=state:${stateFips}`;
    popField = 1;
  } else if (year === 2010) {
    apiUrl = `https://api.census.gov/data/2010/dec/sf1?get=NAME,P001001&for=place:*&in=state:${stateFips}`;
    popField = 1;
  } else if (year === 2000) {
    apiUrl = `https://api.census.gov/data/2000/dec/sf1?get=NAME,P001001&for=place:*&in=state:${stateFips}`;
    popField = 1;
  } else {
    console.log(`  Year ${year} not directly available via Census API`);
    return null;
  }
  
  console.log(`  Fetching from Census API for ${year}...`);
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.log(`  HTTP Error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length < 2) {
      console.log(`  No data returned`);
      return null;
    }
    
    // Improved matching - exact match preferred
    const cityLower = cityName.toLowerCase().trim();
    let bestMatch = null;
    let exactMatch = null;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const placeName = (row[0] || '').toLowerCase();
      const placeNameOnly = placeName.split(',')[0].trim();
      
      // Priority 1: Exact "city name city" match
      if (placeNameOnly === cityLower + ' city') {
        const population = parseInt(row[popField], 10);
        if (!isNaN(population)) {
          console.log(`  ✓ EXACT: "${row[0]}" = ${population.toLocaleString()}`);
          return population;
        }
      }
      
      // Priority 2: Town/village exact match
      if (placeNameOnly === cityLower + ' town' ||
          placeNameOnly === cityLower + ' village' ||
          placeNameOnly === cityLower + ' borough') {
        const population = parseInt(row[popField], 10);
        if (!isNaN(population)) {
          exactMatch = { name: row[0], pop: population };
        }
      }
      
      // Priority 3: Best partial (largest population, starts with city name)
      if (!exactMatch && placeNameOnly.startsWith(cityLower + ' ')) {
        const population = parseInt(row[popField], 10);
        if (!isNaN(population)) {
          if (!bestMatch || population > bestMatch.pop) {
            bestMatch = { name: row[0], pop: population };
          }
        }
      }
    }
    
    if (exactMatch) {
      console.log(`  ✓ FOUND (town/village): "${exactMatch.name}" = ${exactMatch.pop.toLocaleString()}`);
      return exactMatch.pop;
    }
    
    if (bestMatch) {
      console.log(`  ~ PARTIAL: "${bestMatch.name}" = ${bestMatch.pop.toLocaleString()}`);
      return bestMatch.pop;
    }
    
    console.log(`  ✗ NOT FOUND in ${data.length - 1} places`);
    return null;
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('CENSUS BUREAU API TEST');
  console.log('Testing direct city population lookups');
  console.log('='.repeat(60));
  
  const testCases = [
    // Your local cities
    { city: 'Springfield', state: 'MO', year: 2020 },
    { city: 'Springfield', state: 'MO', year: 2010 },
    { city: 'Springfield', state: 'MO', year: 2000 },
    { city: 'Branson', state: 'MO', year: 2020 },
    { city: 'Joplin', state: 'MO', year: 2020 },
    
    // Major cities  
    { city: 'New York', state: 'NY', year: 2020 },
    { city: 'Los Angeles', state: 'CA', year: 2020 },
    { city: 'Chicago', state: 'IL', year: 2010 },
    
    // Smaller cities that might not be in local data
    { city: 'Nixa', state: 'MO', year: 2020 },
    { city: 'Ozark', state: 'MO', year: 2020 },
    { city: 'Republic', state: 'MO', year: 2020 },
  ];
  
  for (const { city, state, year } of testCases) {
    console.log(`\n${city}, ${state} (${year}):`);
    await testCensusAPI(city, state, year);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('API COVERAGE SUMMARY:');
  console.log('- 2020: ✅ Decennial Census DHC');
  console.log('- 2010: ✅ Decennial Census SF1');
  console.log('- 2000: ✅ Decennial Census SF1');
  console.log('- 1990: ⚠️  Limited (no direct place API)');
  console.log('- Pre-1990: ❌ NO API - must use local data files');
  console.log('='.repeat(60));
}

runTests();
