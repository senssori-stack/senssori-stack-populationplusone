// Quick test of city name standardization
import { getDisplayCityState, standardizeCityName } from './src/data/utils/city-name-standardization';

console.log('=== City Name Standardization Test ===');

const testCities = [
  'San Francisco International Airport, California',
  'Los Angeles International Airport, California', 
  'Twentynine Palms Marine Corps Base, California',
  'Dallas Fort Worth International Airport, Texas',
  'John F Kennedy International Airport, New York',
  'Normal Short City, Texas',
  'Las Vegas, Nevada',
  'Regular City Name, Ohio'
];

testCities.forEach(city => {
  const standardized = getDisplayCityState(city);
  console.log(`Original: ${city}`);
  console.log(`Standardized: ${standardized}`);
  console.log(`Length: ${city.length} → ${standardized.length}`);
  console.log('---');
});