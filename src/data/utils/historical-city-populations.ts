// Historical city population data for major US cities
// Data sourced from US Census Bureau historical records

export interface HistoricalCityData {
  city: string;
  state: string;
  populations: { [year: number]: number };
}

export const HISTORICAL_CITY_POPULATIONS: HistoricalCityData[] = [
  {
    city: "Springfield",
    state: "Missouri", 
    populations: {
      2020: 169176,
      2010: 159498,
      2000: 151580,
      1990: 140494,
      1980: 133116,
      1970: 120096,
      1960: 95865,
      1950: 66731, // This matches your Google verification!
      1940: 61238,
      1930: 57527,
      1920: 39631,
      1910: 35201
    }
  },
  {
    city: "Kansas City",
    state: "Missouri",
    populations: {
      2020: 508090,
      2010: 459787,
      2000: 441545,
      1990: 435146,
      1980: 448159,
      1970: 507087,
      1960: 475539,
      1950: 456622,
      1940: 399178,
      1930: 399746,
      1920: 324410,
      1910: 248381
    }
  },
  {
    city: "St. Louis", 
    state: "Missouri",
    populations: {
      2020: 301578,
      2010: 319294,
      2000: 348189,
      1990: 396685,
      1980: 453085,
      1970: 622236,
      1960: 750026,
      1950: 856796,
      1940: 816048,
      1930: 821960,
      1920: 772897,
      1910: 687029
    }
  }
  // Add more cities as needed
];

/**
 * Get historical population for a city in a specific year
 */
export function getHistoricalCityPopulation(cityName: string, year: number): number | null {
  // Parse city and state from input like "Springfield, MO" or "Springfield, Missouri"
  const parts = cityName.split(',').map(p => p.trim());
  if (parts.length !== 2) return null;
  
  const [city, stateInput] = parts;
  
  // Handle state abbreviations
  const stateAbbreviations: { [key: string]: string } = {
    'MO': 'Missouri',
    'KS': 'Kansas', 
    'IL': 'Illinois',
    'CA': 'California',
    'TX': 'Texas',
    'NY': 'New York',
    'FL': 'Florida'
    // Add more as needed
  };
  
  const state = stateAbbreviations[stateInput] || stateInput;
  
  // Find matching city data
  const cityData = HISTORICAL_CITY_POPULATIONS.find(
    c => c.city.toLowerCase() === city.toLowerCase() && 
         c.state.toLowerCase() === state.toLowerCase()
  );
  
  if (!cityData) return null;
  
  // Find exact year or closest year
  if (cityData.populations[year]) {
    return cityData.populations[year];
  }
  
  // Find closest available years and interpolate
  const availableYears = Object.keys(cityData.populations).map(Number).sort((a, b) => a - b);
  
  // Find the two closest years
  let lowerYear = null;
  let upperYear = null;
  
  for (let i = 0; i < availableYears.length; i++) {
    if (availableYears[i] <= year) {
      lowerYear = availableYears[i];
    }
    if (availableYears[i] >= year && !upperYear) {
      upperYear = availableYears[i];
      break;
    }
  }
  
  // If we have both bounds, interpolate
  if (lowerYear && upperYear && lowerYear !== upperYear) {
    const lowerPop = cityData.populations[lowerYear];
    const upperPop = cityData.populations[upperYear];
    const ratio = (year - lowerYear) / (upperYear - lowerYear);
    return Math.round(lowerPop + (upperPop - lowerPop) * ratio);
  }
  
  // Use the closest available year
  if (lowerYear) return cityData.populations[lowerYear];
  if (upperYear) return cityData.populations[upperYear];
  
  return null;
}

/**
 * Get population for a city with historical context
 * If no year provided, returns current population
 */
export async function getPopulationWithHistoricalContext(
  cityName: string, 
  year?: number
): Promise<number | null> {
  // If year provided, try historical data first
  if (year) {
    const historicalPop = getHistoricalCityPopulation(cityName, year);
    if (historicalPop) return historicalPop;
  }
  
  // Fall back to current population system
  const { getPopulationForCity } = await import('./populations');
  return await getPopulationForCity(cityName);
}