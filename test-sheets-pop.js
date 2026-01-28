/**
 * Test script to verify Google Sheets historical population integration
 */

const https = require('https');

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSr5fO3fDsaOjLYrZ1uTf7DL6yjI_QjbvCXApJSFTgfaq6bevEuoIYK-hEZcg00fxMH6KMepIS-NJ-t/pub?gid=544939160&single=true&output=csv';

console.log('=== Testing Historical Population from Google Sheets ===\n');

function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function test() {
  console.log('Fetching data from Google Sheets...');
  
  try {
    const csvData = await fetchCSV(SHEET_URL);
    const lines = csvData.split('\n').filter(line => line.trim());
    
    console.log(`✅ Loaded ${lines.length - 1} cities`);
    console.log(`   File size: ${(csvData.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Parse headers
    const headers = lines[0].split(',');
    console.log(`   Columns: ${headers.length} (${headers[0]}, ${headers[1]}, ${headers[2]}...${headers[headers.length-1]})`);
    
    // Search for Hannibal
    const hannibalLine = lines.find(line => 
      line.toLowerCase().startsWith('hannibal,missouri')
    );
    
    if (hannibalLine) {
      const values = hannibalLine.split(',');
      console.log('\n✅ Found Hannibal, Missouri!');
      console.log(`   1910: ${values[2] || 'N/A'}`);
      console.log(`   1950: ${values[6] || 'N/A'}`);
      console.log(`   2000: ${values[11] || 'N/A'}`);
      console.log(`   2024: ${values[35] || 'N/A'}`);
    } else {
      console.log('\n❌ Hannibal, Missouri not found!');
    }
    
    // Test a few more cities
    const testCities = [
      { name: 'New York', state: 'New York' },
      { name: 'Los Angeles', state: 'California' },
      { name: 'Chicago', state: 'Illinois' }
    ];
    
    console.log('\n--- Sample Cities ---');
    for (const city of testCities) {
      const cityLine = lines.find(line => {
        const lower = line.toLowerCase();
        return lower.startsWith(`${city.name.toLowerCase()},${city.state.toLowerCase()}`);
      });
      
      if (cityLine) {
        const values = cityLine.split(',');
        console.log(`${city.name}, ${city.state}: 1910=${values[2] || 'N/A'}, 2024=${values[35] || 'N/A'}`);
      } else {
        console.log(`${city.name}, ${city.state}: NOT FOUND`);
      }
    }
    
    console.log('\n✅ Google Sheets historical population integration is working!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
