// Test zodiac and birthstone calculations

function getZodiacFromISO(dobISO) {
  const d = new Date(dobISO + 'T00:00:00');
  const md = (d.getMonth() + 1) * 100 + d.getDate();
  console.log(`Date: ${dobISO} → Month-Day: ${md}`);

  if (md >= 321 && md <= 419) return 'Aries';
  if (md >= 420 && md <= 520) return 'Taurus';
  if (md >= 521 && md <= 620) return 'Gemini';
  if (md >= 621 && md <= 722) return 'Cancer';
  if (md >= 723 && md <= 822) return 'Leo';
  if (md >= 823 && md <= 922) return 'Virgo';
  if (md >= 923 && md <= 1022) return 'Libra';
  if (md >= 1023 && md <= 1121) return 'Scorpio';
  if (md >= 1122 && md <= 1221) return 'Sagittarius';
  if (md >= 1222 || md <= 119) return 'Capricorn';
  if (md >= 120 && md <= 218) return 'Aquarius';
  return 'Pisces';
}

function birthstoneFromISO(dobISO) {
  const month = new Date(dobISO + 'T00:00:00').getMonth() + 1;
  const stones = [
    '', 'Garnet', 'Amethyst', 'Aquamarine', 'Diamond', 'Emerald', 'Pearl/Alexandrite',
    'Ruby', 'Peridot/Spinel', 'Sapphire', 'Opal/Tourmaline', 'Topaz/Citrine', 'Turquoise/Tanzanite'
  ];
  console.log(`Date: ${dobISO} → Month: ${month}`);
  return stones[month] || '';
}

console.log('\n=== Testing Zodiac Signs ===');
console.log('Nov 15, 1960:', getZodiacFromISO('1960-11-15'), '(Expected: Scorpio)');
console.log('Jan 1, 2000:', getZodiacFromISO('2000-01-01'), '(Expected: Capricorn)');
console.log('Dec 25, 1971:', getZodiacFromISO('1971-12-25'), '(Expected: Capricorn)');
console.log('Mar 21, 1985:', getZodiacFromISO('1985-03-21'), '(Expected: Aries)');
console.log('Jun 21, 2020:', getZodiacFromISO('2020-06-21'), '(Expected: Cancer)');
console.log('Dec 22, 2020:', getZodiacFromISO('2020-12-22'), '(Expected: Capricorn)');
console.log('Dec 21, 2020:', getZodiacFromISO('2020-12-21'), '(Expected: Sagittarius)');

console.log('\n=== Testing Birthstones ===');
console.log('Nov 15, 1960:', birthstoneFromISO('1960-11-15'), '(Expected: Topaz/Citrine)');
console.log('Jan 1, 2000:', birthstoneFromISO('2000-01-01'), '(Expected: Garnet)');
console.log('Dec 25, 1971:', birthstoneFromISO('1971-12-25'), '(Expected: Turquoise/Tanzanite)');
console.log('Jun 21, 2020:', birthstoneFromISO('2020-06-21'), '(Expected: Pearl/Alexandrite)');
console.log('May 15, 1990:', birthstoneFromISO('1990-05-15'), '(Expected: Emerald)');
