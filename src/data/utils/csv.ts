// src/data/utils/csv.ts
// Tiny CSV utilities that handle quoted commas.

export function parseCSV(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (ch === '"') {
            if (inQuotes && text[i + 1] === '"') {
                // escaped quote
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
                // row break
                if (row.length) rows.push(row);
                row = [];
            }
            continue;
        }

        cur += ch;
    }

    // flush tail
    row.push(cur);
    if (row.length) rows.push(row);

    // trim spaces
    return rows.map(r => r.map(c => c.trim()));
}

export async function fetchCSV(url: string): Promise<string[][]> {
    console.log('📡 Fetching CSV from:', url);

    // Retry logic for mobile networks
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            console.log(`📱 Attempt ${attempt}/3 - Network status:`, navigator.onLine ? 'ONLINE' : 'OFFLINE');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const res = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Accept': 'text/csv,text/plain,*/*'
                }
            });

            clearTimeout(timeoutId);

            // Always read response text so we can include helpful diagnostic info on error
            const txt = await res.text();
            console.log(`✅ CSV fetched - Status: ${res.status}, Length: ${txt.length} chars`);

            if (!res.ok) {
                const snippet = txt ? txt.slice(0, 1000).replace(/\s+/g, ' ') : '<no body>';
                throw new Error(`CSV fetch failed: ${res.status} ${res.statusText} - ${snippet}`);
            }

            // Quick sanity: if Google returned HTML (e.g. an error page) surface that
            if (/<!doctype html>|<html/i.test(txt)) {
                const snippet = txt.slice(0, 1000).replace(/\s+/g, ' ');
                throw new Error(`CSV fetch returned HTML (not CSV). First chars: ${snippet}`);
            }

            const parsed = parseCSV(txt);
            console.log(`📊 CSV parsed - ${parsed.length} rows, ${parsed[0]?.length || 0} columns`);
            return parsed;

        } catch (error) {
            lastError = error as Error;
            console.warn(`❌ Attempt ${attempt} failed:`, lastError.message);

            if (attempt < 3) {
                console.log(`⏳ Waiting ${attempt * 2}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            }
        }
    }

    throw lastError || new Error('All fetch attempts failed');
}
