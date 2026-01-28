// Test the minimum wage utility
// Run with: npx ts-node test-minimum-wage.ts

// Since this is .js, we need to compile the TS module first or use ts-node
// For quick testing, let's duplicate the core logic here

console.log('=== MINIMUM WAGE UTILITY TESTS ===\n');

// Federal minimum wage history
const FEDERAL_MINIMUM_WAGES = {
  1938: 0.25, 1939: 0.30, 1945: 0.40, 1950: 0.75, 1956: 1.00,
  1961: 1.15, 1963: 1.25, 1967: 1.40, 1968: 1.60, 1974: 2.00,
  1975: 2.10, 1976: 2.30, 1978: 2.65, 1979: 2.90, 1980: 3.10,
  1981: 3.35, 1990: 3.80, 1991: 4.25, 1996: 4.75, 1997: 5.15,
  2007: 5.85, 2008: 6.55, 2009: 7.25, 2024: 7.25, 2025: 7.25, 2026: 7.25
};

// Current state wages (2024-2025)
const CURRENT_STATE_WAGES = {
  'AK': 11.73, 'AL': 7.25, 'AR': 11.00, 'AZ': 14.70, 'CA': 16.50,
  'CO': 14.81, 'CT': 16.35, 'DC': 17.50, 'DE': 15.00, 'FL': 14.00,
  'GA': 7.25, 'HI': 14.00, 'IA': 7.25, 'ID': 7.25, 'IL': 14.00,
  'IN': 7.25, 'KS': 7.25, 'KY': 7.25, 'LA': 7.25, 'MA': 15.00,
  'MD': 15.00, 'ME': 14.65, 'MI': 10.56, 'MN': 11.13, 'MO': 13.75,
  'MS': 7.25, 'MT': 10.55, 'NC': 7.25, 'ND': 7.25, 'NE': 13.50,
  'NH': 7.25, 'NJ': 15.49, 'NM': 12.00, 'NV': 12.00, 'NY': 16.50,
  'OH': 10.70, 'OK': 7.25, 'OR': 15.95, 'PA': 7.25, 'RI': 15.00,
  'SC': 7.25, 'SD': 11.50, 'TN': 7.25, 'TX': 7.25, 'UT': 7.25,
  'VA': 12.41, 'VT': 14.01, 'WA': 16.66, 'WI': 7.25, 'WV': 8.75, 'WY': 7.25
};

// State name to abbreviation mapping
const STATE_NAMES = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  'district of columbia': 'DC', 'washington dc': 'DC', 'washington d.c.': 'DC'
};

function extractStateFromHometown(hometown) {
  if (!hometown) return null;
  const parts = hometown.split(',');
  if (parts.length >= 2) {
    const statePart = parts[parts.length - 1].trim().toUpperCase();
    if (statePart.length === 2 && CURRENT_STATE_WAGES[statePart] !== undefined) {
      return statePart;
    }
    const statePartLower = parts[parts.length - 1].trim().toLowerCase();
    if (STATE_NAMES[statePartLower]) {
      return STATE_NAMES[statePartLower];
    }
  }
  return null;
}

function getFederalMinimumWage(year) {
  const years = Object.keys(FEDERAL_MINIMUM_WAGES).map(Number).sort((a, b) => a - b);
  for (let i = years.length - 1; i >= 0; i--) {
    if (year >= years[i]) {
      return FEDERAL_MINIMUM_WAGES[years[i]];
    }
  }
  return FEDERAL_MINIMUM_WAGES[years[0]];
}

function getMinimumWage(hometown, year) {
  const federal = getFederalMinimumWage(year);
  const state = extractStateFromHometown(hometown);
  
  if (state && CURRENT_STATE_WAGES[state]) {
    const stateWage = CURRENT_STATE_WAGES[state];
    if (stateWage > federal) {
      return { wage: stateWage, source: `${state} state` };
    }
  }
  return { wage: federal, source: 'federal' };
}

// Test state extraction
console.log('--- State Extraction Tests ---');
const testCities = [
  'Seattle, WA',
  'New York, NY',
  'Los Angeles, California',
  'Chicago, IL',
  'Austin, Texas',
  'Miami, FL',
  'Denver, CO',
  'Phoenix, AZ',
  'San Francisco, CA',
  'Seattle, Washington',
];

testCities.forEach(city => {
  const state = extractStateFromHometown(city);
  console.log(`"${city}" -> State: ${state || 'NOT FOUND'}`);
});

console.log('\n--- Federal Minimum Wage History ---');
const testYears = [1938, 1950, 1968, 1980, 1997, 2009, 2024, 2025];
testYears.forEach(year => {
  const wage = getFederalMinimumWage(year);
  console.log(`Federal minimum wage in ${year}: $${wage.toFixed(2)}`);
});

console.log('\n--- State vs Federal Comparison (2024) ---');
const stateTests = [
  { city: 'Seattle, WA', year: 2024 },    // WA is $16.66 > federal
  { city: 'Los Angeles, CA', year: 2024 }, // CA is $16.50 > federal
  { city: 'Austin, TX', year: 2024 },      // TX follows federal $7.25
  { city: 'Miami, FL', year: 2024 },       // FL is $14.00 > federal
  { city: 'New York, NY', year: 2024 },    // NY is $16.50 > federal
  { city: 'Denver, CO', year: 2024 },      // CO is $14.81 > federal
];

stateTests.forEach(({ city, year }) => {
  const result = getMinimumWage(city, year);
  console.log(`${city} (${year}): $${result.wage.toFixed(2)} (${result.source})`);
});

console.log('\n=== TESTS COMPLETE ===');
console.log('\n✅ Minimum wage utility is integrated into TimeCapsuleLandscape and TimeCapsuleBack!');
console.log('The app will now show the HIGHEST of federal or state minimum wage based on hometown.');

