// Check what data is loading for November 15, 1971
import { getSnapshotWithHistorical } from './src/data/utils/historical-snapshot';

async function check1971Data() {
  console.log('=== CHECKING 1971 DATA (Nov 15, 1971) ===\n');
  
  try {
    const data1971 = await getSnapshotWithHistorical('1971-11-15');
    
    console.log('--- All 1971 Data ---');
    Object.entries(data1971).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
    console.log('\n--- Key 1971 Values You Mentioned ---');
    console.log('Vice President 1971:', data1971['VICE PRESIDENT']);
    console.log('Loaf of Bread 1971:', data1971['LOAF OF BREAD']);
    console.log('Dozen Eggs 1971:', data1971['DOZEN EGGS']);
    console.log('Silver 1971:', data1971['TROY OUNCE OF SILVER'] || data1971['SILVER OZ']);
    console.log('President 1971:', data1971['PRESIDENT']);
    console.log('Gas 1971:', data1971['GALLON OF GASOLINE']);
    
  } catch (error) {
    console.log('Error loading 1971 data:', error);
  }
}

check1971Data().catch(console.error);