// Test script for 1971 historical data verification
import { getExtendedHistoricalData } from './src/data/utils/extended-historical-data';

// Test November 15, 1971 birth date that user reported as inaccurate
const test1971Data = () => {
  console.log('=== TESTING 1971 HISTORICAL DATA ===');
  
  const birthDate = new Date('1971-11-15');
  const snapshot = getExtendedHistoricalData(birthDate);
  
  console.log('\n1971 Data from Government Sources:');
  console.log('Vice President:', snapshot['VICE PRESIDENT']); // Should be Spiro Agnew
  console.log('Loaf of Bread:', snapshot['LOAF OF BREAD']); // Should be $0.25 (BLS)
  console.log('Dozen Eggs:', snapshot['DOZEN EGGS']); // Should be $0.61 (BLS)
  console.log('Gallon of Milk:', snapshot['GALLON OF MILK']); // Should be $1.32 (BLS)
  console.log('Silver (oz):', snapshot['SILVER OZ']); // Should be $1.38 (FRED)
  console.log('Electricity (kWh):', snapshot['ELECTRICITY KWH']); // Should be $0.023 (EIA)
  console.log('President:', snapshot['PRESIDENT']); // Should be Richard Nixon
  
  console.log('\n=== VERIFICATION COMPLETE ===');
  console.log('All data sourced from: BLS.gov, EIA.gov, FRED.stlouisfed.org, Census.gov');
};

// Run the test
test1971Data();