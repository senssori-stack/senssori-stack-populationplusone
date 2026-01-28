/**
 * Convert city-coordinates.csv to TypeScript map for fast lookups
 * This generates src/data/utils/city-coordinates-data.ts
 */

const fs = require('fs');
const path = require('path');

function convertToTS() {
  const csvPath = path.join(__dirname, 'city-coordinates.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  
  // Remove header
  lines.shift();
  
  const cityMap = {};
  let count = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Parse CSV line with proper quote handling
    const parts = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current);
    
    const [city, state, state_id, lat, lng] = parts.map(p => p.replace(/^"|"$/g, '').trim());
    
    if (city && state && lat && lng) {
      // Create keys for lookup
      const key1 = `${city.toLowerCase()} ${state.toLowerCase()}`;
      const key2 = `${city.toLowerCase()} ${state_id?.toLowerCase() || ''}`;
      
      const value = { lat: parseFloat(lat), lng: parseFloat(lng), state, state_id };
      
      cityMap[key1] = value;
      if (state_id) {
        cityMap[key2] = value;
      }
      count++;
    }
  }

  // Generate TypeScript file
  const tsContent = `/**
 * AUTO-GENERATED: City coordinates lookup map
 * Generated from US Census Bureau incorporated cities data
 * Do not edit manually - regenerate using: node generate-city-coordinates-ts.js
 */

export interface CityCoordinates {
  lat: number;
  lng: number;
  state: string;
  state_id?: string;
}

export const CITY_COORDINATES_MAP: { [key: string]: CityCoordinates } = ${JSON.stringify(cityMap, null, 2)};

export function getCityCoordinates(city: string, state: string): CityCoordinates | null {
  // Try exact match first
  let key = \`\${city.toLowerCase()} \${state.toLowerCase()}\`;
  if (CITY_COORDINATES_MAP[key]) {
    return CITY_COORDINATES_MAP[key];
  }
  
  // Try with state abbreviation
  const stateAbbrev = STATE_ABBREVIATIONS[state.toLowerCase()];
  if (stateAbbrev) {
    key = \`\${city.toLowerCase()} \${stateAbbrev.toLowerCase()}\`;
    if (CITY_COORDINATES_MAP[key]) {
      return CITY_COORDINATES_MAP[key];
    }
  }
  
  return null;
}

export function formatCoordinates(lat: number, lng: number): string {
  return \`\${lat.toFixed(4)}, \${lng.toFixed(4)}\`;
}

const STATE_ABBREVIATIONS: { [key: string]: string } = {
  'alabama': 'AL',
  'alaska': 'AK',
  'arizona': 'AZ',
  'arkansas': 'AR',
  'california': 'CA',
  'colorado': 'CO',
  'connecticut': 'CT',
  'delaware': 'DE',
  'florida': 'FL',
  'georgia': 'GA',
  'hawaii': 'HI',
  'idaho': 'ID',
  'illinois': 'IL',
  'indiana': 'IN',
  'iowa': 'IA',
  'kansas': 'KS',
  'kentucky': 'KY',
  'louisiana': 'LA',
  'maine': 'ME',
  'maryland': 'MD',
  'massachusetts': 'MA',
  'michigan': 'MI',
  'minnesota': 'MN',
  'mississippi': 'MS',
  'missouri': 'MO',
  'montana': 'MT',
  'nebraska': 'NE',
  'nevada': 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  'ohio': 'OH',
  'oklahoma': 'OK',
  'oregon': 'OR',
  'pennsylvania': 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  'tennessee': 'TN',
  'texas': 'TX',
  'utah': 'UT',
  'vermont': 'VT',
  'virginia': 'VA',
  'washington': 'WA',
  'west virginia': 'WV',
  'wisconsin': 'WI',
  'wyoming': 'WY',
  'district of columbia': 'DC',
};
`;

  const outputPath = path.join(__dirname, 'src', 'data', 'utils', 'city-coordinates-data.ts');
  fs.writeFileSync(outputPath, tsContent, 'utf-8');
  
  console.log(`\n✅ Generated ${outputPath}`);
  console.log(`📊 Total cities: ${count}`);
  console.log(`💾 File size: ${Math.round(fs.statSync(outputPath).size / 1024)}KB`);
}

convertToTS();
