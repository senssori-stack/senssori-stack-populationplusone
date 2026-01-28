// Known US cities with long names that cause display issues
// This is not a complete top 100 list, but covers the most common problematic cases

export const LONG_US_CITY_NAMES = [
  // Very long city names (25+ characters)
  "Rancho Santa Margarita, CA", // 21 chars (reasonable)
  "North Myrtle Beach, SC", // 19 chars
  "Virginia Beach, VA", // 15 chars (reasonable)
  "Colorado Springs, CO", // 17 chars (reasonable)
  "Huntington Beach, CA", // 17 chars (reasonable)
  "Manhattan Beach, CA", // 16 chars (reasonable)
  "Redondo Beach, CA", // 14 chars (reasonable)
  "Newport Beach, CA", // 14 chars (reasonable)
  "Rehoboth Beach, DE", // 15 chars (reasonable)
  "Myrtle Beach, SC", // 13 chars (reasonable)
  "Daytona Beach, FL", // 14 chars (reasonable)
  "Panama City Beach, FL", // 18 chars
  "Ormond Beach, FL", // 13 chars (reasonable)
  "Delray Beach, FL", // 13 chars (reasonable)
  "Boynton Beach, FL", // 14 chars (reasonable)
  "Deerfield Beach, FL", // 16 chars (reasonable)
  "Pompano Beach, FL", // 14 chars (reasonable)
  "West Palm Beach, FL", // 16 chars (reasonable)
  
  // Compound/hyphenated cities
  "Winston-Salem, NC", // 14 chars (reasonable)
  "Wilkes-Barre, PA", // 13 chars (reasonable)
  "Kiawah Island, SC", // 14 chars (reasonable)
  
  // Military bases (not actual cities but often used as addresses)
  "Travis Air Force Base, CA", // 22 chars - PROBLEMATIC
  "Edwards Air Force Base, CA", // 23 chars - PROBLEMATIC  
  "Twentynine Palms Marine Corps Base, CA", // 35 chars - VERY PROBLEMATIC
  "Naval Air Station Pensacola, FL", // 28 chars - PROBLEMATIC
  "Fort Bragg, NC", // 11 chars (reasonable)
  "Fort Hood, TX", // 10 chars (reasonable)
  
  // Airports (not cities but used as addresses)
  "San Francisco International Airport, CA", // 36 chars - VERY PROBLEMATIC
  "Los Angeles International Airport, CA", // 34 chars - VERY PROBLEMATIC
  "Dallas Fort Worth International Airport, TX", // 40 chars - EXTREMELY PROBLEMATIC
  "John F Kennedy International Airport, NY", // 37 chars - VERY PROBLEMATIC
  "LaGuardia Airport, NY", // 17 chars
  "Newark Liberty International Airport, NJ", // 37 chars - VERY PROBLEMATIC
  "Miami International Airport, FL", // 28 chars - PROBLEMATIC
  "Orlando International Airport, FL", // 30 chars - PROBLEMATIC
  "Tampa International Airport, FL", // 28 chars - PROBLEMATIC
  "Phoenix Sky Harbor International Airport, AZ", // 41 chars - EXTREMELY PROBLEMATIC
  "George Bush Intercontinental Airport, TX", // 37 chars - VERY PROBLEMATIC
  "Ronald Reagan Washington National Airport, VA", // 42 chars - EXTREMELY PROBLEMATIC
  
  // Universities (not cities but used as addresses)
  "California Polytechnic State University, CA", // 40 chars - EXTREMELY PROBLEMATIC
  "California State University Long Beach, CA", // 39 chars - VERY PROBLEMATIC
  "California State University Fullerton, CA", // 38 chars - VERY PROBLEMATIC
  "University of California Los Angeles, CA", // 37 chars - VERY PROBLEMATIC
  "University of California Berkeley, CA", // 34 chars - VERY PROBLEMATIC
  "Massachusetts Institute of Technology, MA", // 38 chars - VERY PROBLEMATIC
  "Carnegie Mellon University, PA", // 27 chars - PROBLEMATIC
  
  // Native American reservation names
  "Standing Rock Indian Reservation, ND", // 33 chars - VERY PROBLEMATIC
  "Pine Ridge Indian Reservation, SD", // 30 chars - PROBLEMATIC
  "Wind River Indian Reservation, WY", // 30 chars - PROBLEMATIC
  
  // State institutions
  "California Department of Motor Vehicles, CA", // 40 chars - EXTREMELY PROBLEMATIC
  "California Department of Transportation, CA", // 40 chars - EXTREMELY PROBLEMATIC
  
  // Other long institutional addresses
  "Walt Disney World Resort, FL", // 25 chars - PROBLEMATIC
  "Universal Studios Hollywood, CA", // 28 chars - PROBLEMATIC
  "Yellowstone National Park, WY", // 26 chars - PROBLEMATIC
  "Grand Canyon National Park, AZ", // 27 chars - PROBLEMATIC
  "Great Smoky Mountains National Park, TN", // 36 chars - VERY PROBLEMATIC
];

// Categorize by length for analysis
export const CITY_LENGTH_ANALYSIS = {
  reasonable: LONG_US_CITY_NAMES.filter(city => city.length <= 20),
  problematic: LONG_US_CITY_NAMES.filter(city => city.length > 20 && city.length <= 30),
  veryProblematic: LONG_US_CITY_NAMES.filter(city => city.length > 30 && city.length <= 40),
  extremelyProblematic: LONG_US_CITY_NAMES.filter(city => city.length > 40),
};

// Most common patterns causing length issues
export const PROBLEMATIC_PATTERNS = [
  "International Airport",
  "Air Force Base", 
  "Marine Corps Base",
  "Naval Air Station",
  "State University",
  "National Park",
  "Indian Reservation",
  "Department of",
];

console.log("=== US City Name Length Analysis ===");
console.log(`Total cities analyzed: ${LONG_US_CITY_NAMES.length}`);
console.log(`Reasonable (≤20 chars): ${CITY_LENGTH_ANALYSIS.reasonable.length}`);
console.log(`Problematic (21-30 chars): ${CITY_LENGTH_ANALYSIS.problematic.length}`);
console.log(`Very Problematic (31-40 chars): ${CITY_LENGTH_ANALYSIS.veryProblematic.length}`);
console.log(`Extremely Problematic (40+ chars): ${CITY_LENGTH_ANALYSIS.extremelyProblematic.length}`);

console.log("\n=== Most Problematic Examples ===");
CITY_LENGTH_ANALYSIS.extremelyProblematic.forEach(city => {
  console.log(`${city} (${city.length} chars)`);
});

console.log("\n=== Very Problematic Examples ===");
CITY_LENGTH_ANALYSIS.veryProblematic.slice(0, 10).forEach(city => {
  console.log(`${city} (${city.length} chars)`);
});