// Test Google Sheets historical population data using native fetch
// Node.js 18+ has native fetch that handles redirects automatically

const HISTORICAL_POPULATIONS_CSV_URL = 
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSr5fO3fDsaOjLYrZ1uTf7DL6yjI_QjbvCXApJSFTgfaq6bevEuoIYK-hEZcg00fxMH6KMepIS-NJ-t/pub?gid=544939160&single=true&output=csv';

async function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && (ch === ',' || ch === '\n' || ch === '\r')) {
      row.push(cur);
      cur = '';
      if (ch !== ',') {
        if (row.length) rows.push(row);
        row = [];
      }
      continue;
    }
    cur += ch;
  }
  row.push(cur);
  if (row.length) rows.push(row);
  return rows.map(r => r.map(c => c.trim()));
}

async function testSheetsConnection() {
  console.log('Testing Google Sheets Historical Population Data...\n');
  console.log('URL:', HISTORICAL_POPULATIONS_CSV_URL);
  console.log('');

  try {
    console.log('Fetching data (using native fetch)...');
    const res = await fetch(HISTORICAL_POPULATIONS_CSV_URL, {
      headers: {
        'Accept': 'text/csv,text/plain,*/*'
      }
    });
    
    console.log('Response status:', res.status);
    console.log('Response redirected:', res.redirected);
    console.log('Response URL:', res.url);
    
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
    }
    
    const text = await res.text();
    console.log('\nData size:', (text.length / 1024 / 1024).toFixed(2), 'MB');
    
    // Check for HTML error page
    if (/<!doctype html>|<html/i.test(text)) {
      console.error('\n❌ ERROR: Received HTML instead of CSV!');
      console.log('First 500 chars:', text.slice(0, 500));
      return;
    }
    
    const csv = await parseCSV(text);
    console.log('Total rows:', csv.length);
    console.log('Total cities:', csv.length - 1); // minus header
    
    // Show headers
    if (csv.length > 0) {
      console.log('\nHeaders:', csv[0].slice(0, 10).join(', '), '...');
      console.log('Year columns:', csv[0].slice(2, 17).join(', '), '...');
    }
    
    // Look up specific cities for verification
    const testCities = [
      { city: 'Hannibal', state: 'Missouri' },
      { city: 'Springfield', state: 'Missouri' },
      { city: 'Kansas City', state: 'Missouri' },
      { city: 'St. Louis', state: 'Missouri' },
      { city: 'New York', state: 'New York' },
      { city: 'Los Angeles', state: 'California' }
    ];
    
    console.log('\n--- Test City Lookups ---');
    
    for (const test of testCities) {
      const found = csv.find(row => 
        row[0]?.toLowerCase() === test.city.toLowerCase() &&
        row[1]?.toLowerCase() === test.state.toLowerCase()
      );
      
      if (found) {
        console.log(`\n✅ ${test.city}, ${test.state}:`);
        // Show some population values
        const years = csv[0];
        const pops = [];
        for (let i = 2; i < Math.min(years.length, 17); i++) {
          if (found[i]) {
            pops.push(`${years[i]}: ${found[i]}`);
          }
        }
        console.log('   ', pops.join(', '));
      } else {
        console.log(`\n❌ ${test.city}, ${test.state}: NOT FOUND`);
      }
    }
    
    // Count states
    const states = new Set();
    for (let i = 1; i < csv.length; i++) {
      if (csv[i][1]) states.add(csv[i][1]);
    }
    console.log('\n--- Summary ---');
    console.log('Total states:', states.size);
    console.log('States:', Array.from(states).sort().join(', '));
    
    console.log('\n✅ Google Sheets connection is WORKING!');
    console.log('The React Native app will be able to fetch this data.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testSheetsConnection();
