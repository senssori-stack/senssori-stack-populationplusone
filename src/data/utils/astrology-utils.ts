// Comprehensive astrology utilities

/**
 * Calculate Chinese Zodiac animal based on birth year
 */
export function getChineseZodiac(year: number): string {
    const animals = [
        'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
        'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
    ];

    // Chinese zodiac starts with Rat in 1924, cycles every 12 years
    const baseYear = 1924;
    const index = (year - baseYear) % 12;
    return animals[index < 0 ? index + 12 : index];
}

/**
 * Generate lucky numbers based on birth date (numerology-based)
 */
export function getLuckyNumbers(dateISO: string): number[] {
    const date = new Date(dateISO);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Generate 6 unique lucky numbers using date digits
    const luckyNumbers: number[] = [];

    // Primary lucky number: day of birth
    luckyNumbers.push(day);

    // Second: month number
    if (month !== day) luckyNumbers.push(month);

    // Third: life path number (sum of all digits reduced to single digit)
    const lifePathDigits = `${day}${month}${year}`.split('').map(Number);
    let lifePathSum = lifePathDigits.reduce((a, b) => a + b, 0);
    while (lifePathSum > 9 && lifePathSum !== 11 && lifePathSum !== 22 && lifePathSum !== 33) {
        lifePathSum = lifePathSum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }
    if (!luckyNumbers.includes(lifePathSum)) luckyNumbers.push(lifePathSum);

    // Fourth: birth year last two digits modulo 50
    const yearLucky = (year % 100) % 50;
    if (yearLucky > 0 && !luckyNumbers.includes(yearLucky)) luckyNumbers.push(yearLucky);

    // Fifth: day + month
    const dayMonthSum = (day + month) % 50;
    if (dayMonthSum > 0 && !luckyNumbers.includes(dayMonthSum)) luckyNumbers.push(dayMonthSum);

    // Sixth: Generate from full date hash
    const dateSum = (day * month + year) % 49 + 1;
    if (!luckyNumbers.includes(dateSum)) luckyNumbers.push(dateSum);

    // Ensure we have exactly 6 unique numbers between 1-49
    while (luckyNumbers.length < 6) {
        const num = ((luckyNumbers[luckyNumbers.length - 1] * 7 + day) % 49) + 1;
        if (!luckyNumbers.includes(num)) luckyNumbers.push(num);
    }

    return luckyNumbers.slice(0, 6).sort((a, b) => a - b);
}

/**
 * Convert number to Roman numerals
 */
export function toRomanNumerals(num: number): string {
    const romanMap: [number, string][] = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];

    let result = '';
    for (const [value, numeral] of romanMap) {
        while (num >= value) {
            result += numeral;
            num -= value;
        }
    }
    return result;
}

/**
 * Convert date to Roman numeral format (MM/DD/YYYY)
 */
export function dateToRomanNumerals(dateISO: string): string {
    const date = new Date(dateISO);
    const month = toRomanNumerals(date.getMonth() + 1);
    const day = toRomanNumerals(date.getDate());
    const year = toRomanNumerals(date.getFullYear());

    return `${month}/${day}/${year}`;
}

/**
 * Calculate age in dog years (1 human year ≈ 7 dog years for simplicity)
 */
export function getAgeInDogYears(dateISO: string): number {
    const birthDate = new Date(dateISO);
    const today = new Date();

    // Calculate age in days for precision
    const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

    // More accurate dog years calculation
    // First year = 15 dog years, second year = 9 dog years, then 5 dog years per human year
    const ageInYears = ageInDays / 365.25;

    if (ageInYears < 1) {
        return Math.round(ageInYears * 15);
    } else if (ageInYears < 2) {
        return Math.round(15 + (ageInYears - 1) * 9);
    } else {
        return Math.round(24 + (ageInYears - 2) * 5);
    }
}

/**
 * Get Chinese zodiac element based on birth year
 */
export function getChineseElement(year: number): string {
    const elements = ['Metal', 'Water', 'Wood', 'Fire', 'Earth'];
    const index = Math.floor((year % 10) / 2);
    return elements[index];
}

/**
 * Get Chinese zodiac Yin/Yang polarity
 */
export function getChineseYinYang(year: number): string {
    return year % 2 === 0 ? 'Yang' : 'Yin';
}
