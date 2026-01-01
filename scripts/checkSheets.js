// scripts/checkSheets.js
// Robust Node script to fetch published Google Sheets CSV URLs and print status/snippets.
// It will first try to load `src/config/sheets-overrides.json`.
// If that doesn't exist, it will parse `src/data/utils/sheets.ts` to extract the constants.

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

function loadUrls() {
  const overridesPath = path.join(__dirname, '../src/config/sheets-overrides.json');
  if (fs.existsSync(overridesPath)) {
    try {
      const data = require(overridesPath);
      return {
        SNAPSHOT_CSV_URL: data.SNAPSHOT_CSV_URL,
        POPULATIONS_CSV_URL: data.POPULATIONS_CSV_URL,
      };
    } catch (err) {
      console.warn('Failed to load overrides JSON, falling back to parsing TS file:', err.message || err);
    }
  }

  const tsPath = path.join(__dirname, '../src/data/utils/sheets.ts');
  if (!fs.existsSync(tsPath)) {
    throw new Error('Cannot find sheets config: neither overrides JSON nor sheets.ts present');
  }
  const txt = fs.readFileSync(tsPath, 'utf8');

  const snapMatch = txt.match(/SNAPSHOT_CSV_URL\s*=\s*['"]([^'"]+)['"]/);
  const popMatch = txt.match(/POPULATIONS_CSV_URL\s*=\s*['"]([^'"]+)['"]/);

  return {
    SNAPSHOT_CSV_URL: snapMatch ? snapMatch[1] : undefined,
    POPULATIONS_CSV_URL: popMatch ? popMatch[1] : undefined,
  };
}

async function check(name, url) {
  if (!url) {
    console.log(`Skipping ${name}: no URL provided`);
    return;
  }
  console.log('Checking', name, url);
  try {
    const res = await fetch(url);
    const txt = await res.text();
    console.log('Status:', res.status, res.statusText);
    const clean = (txt || '').slice(0, 1200).replace(/\s+/g, ' ');
    console.log('Body snippet:', clean);
  } catch (err) {
    console.error('Fetch error:', err.message || err);
  }
  console.log('---');
}

(async () => {
  let urls;
  try {
    urls = loadUrls();
  } catch (err) {
    console.error('Error loading sheet URLs:', err.message || err);
    process.exit(1);
  }

  await check('SNAPSHOT_CSV_URL', urls.SNAPSHOT_CSV_URL);
  await check('POPULATIONS_CSV_URL', urls.POPULATIONS_CSV_URL);
})();
