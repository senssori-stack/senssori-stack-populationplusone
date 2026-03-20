// Fetch historical Dow Jones daily closing prices from Macrotrends
// Run: node scripts/fetch-dow-history.js

const https = require('https');
const fs = require('fs');
const path = require('path');

function fetch(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        };
        https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetch(res.headers.location).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function main() {
    console.log('Fetching Dow Jones historical data from Macrotrends...');

    const html = await fetch('https://www.macrotrends.net/1319/dow-jones-100-year-historical-chart');

    // Macrotrends embeds data as: var originalData = [[date, value], ...];
    // The data variable feeds into chartData via a loop
    // Look for the array of arrays pattern: [["YYYY-MM-DD", value], ...]

    // Pattern 1: Look for the data assignment with array of arrays
    const dataMatch = html.match(/var\s+originalData\s*=\s*(\[\[[\s\S]*?\]\]);/);

    if (dataMatch) {
        console.log('Found originalData pattern');
        processArrayData(dataMatch[1]);
        return;
    }

    // Pattern 2: Look for inline data in script tags - array of arrays
    const inlineMatch = html.match(/data\s*=\s*(\[\[["'][\d-]+["'],\s*[\d.]+\][\s\S]*?\]);/);
    if (inlineMatch) {
        console.log('Found inline data pattern');
        processArrayData(inlineMatch[1]);
        return;
    }

    // Pattern 3: Extract from the HTML table directly
    console.log('Trying HTML table extraction...');
    extractFromTable(html);
    const rowRegex = /<tr[^>]*>\s*<td[^>]*>(\d{4}-\d{2}-\d{2})<\/td>\s*<td[^>]*>[^<]*<\/td>\s*<td[^>]*>([\d,]+\.\d+)<\/td>/g;
    let match;
    while ((match = rowRegex.exec(html)) !== null) {
        rows.push({
            date: match[1],
            close: parseFloat(match[2].replace(/,/g, ''))
        });
    }

    if (rows.length === 0) {
        console.error('Could not extract any data. Saving HTML for debugging...');
        fs.writeFileSync(path.join(__dirname, 'macrotrends-debug.html'), html.substring(0, 5000));
        console.log('First 5000 chars saved to scripts/macrotrends-debug.html');
        return;
    }

    saveData(rows);
}

function processArrayData(jsonStr) {
    try {
        const cleaned = jsonStr.replace(/'/g, '"');
        const rawData = JSON.parse(cleaned);

        const rows = rawData.map(item => ({
            date: item[0],
            close: parseFloat(item[1].toString().replace(/,/g, ''))
        })).filter(r => r.date && !isNaN(r.close));

        saveData(rows);
    } catch (e) {
        console.error('Failed to parse array data:', e.message);
        console.log('Preview:', jsonStr.substring(0, 300));
    }
}

function processData(jsonStr) {
    try {
        // Clean up the JSON string
        const cleaned = jsonStr
            .replace(/'/g, '"')
            .replace(/,\s*\]/g, ']');

        const rawData = JSON.parse(cleaned);

        const rows = rawData.map(item => ({
            date: item.date || item.d,
            close: parseFloat((item.close || item.v || item.c || '0').toString().replace(/,/g, ''))
        })).filter(r => r.date && !isNaN(r.close));

        saveData(rows);
    } catch (e) {
        console.error('Failed to parse JSON:', e.message);
        console.log('Raw data preview:', jsonStr.substring(0, 500));
    }
}

function saveData(rows) {
    // Sort by date ascending
    rows.sort((a, b) => a.date.localeCompare(b.date));

    // Build a compact lookup: { "YYYY-MM-DD": close_price }
    const lookup = {};
    rows.forEach(r => {
        lookup[r.date] = r.close;
    });

    const outPath = path.join(__dirname, '..', 'src', 'data', 'dow-jones-historical.json');
    fs.writeFileSync(outPath, JSON.stringify(lookup, null, 0));

    const dates = Object.keys(lookup);
    console.log(`Done! ${dates.length} daily records saved.`);
    console.log(`Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
    console.log(`File: src/data/dow-jones-historical.json (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

main().catch(err => {
    console.error('Error:', err.message);
});
