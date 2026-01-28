/**
 * Test the dateToLocalISO function to verify the timezone bug is fixed
 */

// Inline implementation for testing
function dateToLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Test cases
console.log('=== Testing dateToLocalISO fix ===\n');

// October 31, 2025 should stay October 31, not shift to October 30
const oct31 = new Date(2025, 9, 31); // Month is 0-indexed
const iso1 = dateToLocalISO(oct31);
console.log(`October 31, 2025 → ${iso1}`);
console.log(`  Expected: 2025-10-31`);
console.log(`  Status: ${iso1 === '2025-10-31' ? '✓ PASS' : '✗ FAIL'}\n`);

// January 1, 2026 should stay January 1
const jan1 = new Date(2026, 0, 1);
const iso2 = dateToLocalISO(jan1);
console.log(`January 1, 2026 → ${iso2}`);
console.log(`  Expected: 2026-01-01`);
console.log(`  Status: ${iso2 === '2026-01-01' ? '✓ PASS' : '✗ FAIL'}\n`);

// December 31, 2025 should stay December 31
const dec31 = new Date(2025, 11, 31);
const iso3 = dateToLocalISO(dec31);
console.log(`December 31, 2025 → ${iso3}`);
console.log(`  Expected: 2025-12-31`);
console.log(`  Status: ${iso3 === '2025-12-31' ? '✓ PASS' : '✗ FAIL'}\n`);

// Compare with broken toISOString() method for reference
console.log('=== Comparison with broken toISOString() ===');
console.log(`October 31, 2025 using toISOString().split('T')[0]:`);
console.log(`  → ${oct31.toISOString().split('T')[0]}`);
console.log(`  (This will be wrong in western timezones)\n`);
