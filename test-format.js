// Test population formatting
const { formatSnapshotValue } = require('./src/data/utils/formatSnapshot.ts');

// Test the formatter with different numbers
console.log('=== Testing formatSnapshotValue for Population ===');

console.log('Small number (161,000,000):');
console.log(formatSnapshotValue('US POPULATION', '161000000'));

console.log('\nLarge number (3,700,000,000):');
console.log(formatSnapshotValue('WORLD POPULATION', '3700000000'));

console.log('\nString with commas:');
console.log(formatSnapshotValue('US POPULATION', '161,000,000'));

console.log('\nString with spaces:');
console.log(formatSnapshotValue('WORLD POPULATION', '3 700 000 000'));

console.log('\nEmpty/invalid:');
console.log(formatSnapshotValue('US POPULATION', ''));
console.log(formatSnapshotValue('US POPULATION', 'invalid'));