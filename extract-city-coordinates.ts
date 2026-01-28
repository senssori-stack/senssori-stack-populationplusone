/**
 * Extract city coordinates from uscities.csv and create a clean dataset for Google Sheets
 * Output: city-coordinates.csv with format: city,state,state_id,lat,lng
 */

const fs = require('fs');
const path = require('path');

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function extractCityCoordinates() {
  const csvPath = path.join(__dirname, 'uscities', 'uscities.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = fileContent.split('\n');
  
  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  const headerMap: { [key: string]: number } = {};
  
  headers.forEach((header, index) => {
    headerMap[header.replace(/"/g, '')] = index;
  });

  console.log(`📖 Headers found: ${Object.keys(headerMap).join(', ')}`);

  // Extract city data
  const cities = [];

  for (let i = 1; i < lines.length; i++) {
    if (i % 5000 === 0) {
      console.log(`⏳ Processing line ${i}/${lines.length}...`);
    }

    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);

    // Extract fields
    const city = (fields[headerMap['city']] || '').replace(/"/g, '').trim();
    const state_name = (fields[headerMap['state_name']] || '').replace(/"/g, '').trim();
    const state_id = (fields[headerMap['state_id']] || '').replace(/"/g, '').trim();
    const lat = (fields[headerMap['lat']] || '').replace(/"/g, '').trim();
    const lng = (fields[headerMap['lng']] || '').replace(/"/g, '').trim();
    const incorporated = (fields[headerMap['incorporated']] || 'FALSE').replace(/"/g, '').trim();

    // Only include incorporated cities
    if (incorporated === 'TRUE' && city && state_name && lat && lng) {
      cities.push({
        city,
        state: state_name,
        state_id,
        lat,
        lng,
      });
    }
  }

  console.log(`\n✅ Extracted ${cities.length} incorporated cities`);

  // Sort by state and city name for easier lookup
  cities.sort((a, b) => {
    if (a.state !== b.state) {
      return a.state.localeCompare(b.state);
    }
    return a.city.localeCompare(b.city);
  });

  // Create CSV output
  const csvHeader = 'city,state,state_id,lat,lng';
  const csvLines = cities.map(
    (c) => `"${c.city.replace(/"/g, '""')}","${c.state}","${c.state_id}",${c.lat},${c.lng}`
  );

  const csvContent = [csvHeader, ...csvLines].join('\n');

  // Write to file
  const outputPath = path.join(__dirname, 'city-coordinates.csv');
  fs.writeFileSync(outputPath, csvContent, 'utf-8');

  console.log(`\n💾 Saved ${cities.length} cities to: ${outputPath}`);
  console.log(`\n📋 Sample rows (first 5):`);
  cities.slice(0, 5).forEach((c) => {
    console.log(`   ${c.city}, ${c.state} - Lat: ${c.lat}, Lng: ${c.lng}`);
  });

  console.log(`\n📋 Sample rows (last 5):`);
  cities.slice(-5).forEach((c) => {
    console.log(`   ${c.city}, ${c.state} - Lat: ${c.lat}, Lng: ${c.lng}`);
  });
}

extractCityCoordinates();
