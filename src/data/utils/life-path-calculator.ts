// src/data/utils/life-path-calculator.ts
// Calculate Life Path Number from birth date

export interface LifePathResult {
    number: number;
    url: string;
}

const LIFE_PATH_URLS: Record<number, string> = {
    1: 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/#1',
    2: 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/#2',
    3: 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/#3',
    4: 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/#4',
    5: 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/#5',
    6: 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/#6',
    7: 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/#7',
    8: 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/#8',
    9: 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/#9',
    11: 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/#11',
    22: 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/#22',
    33: 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/#33',
};

function reduceToSingleOrMaster(num: number): number {
    // If it's already a master number, don't reduce it further
    if (num === 11 || num === 22 || num === 33) {
        return num;
    }

    // If single digit, return it
    if (num < 10) {
        return num;
    }

    // Add digits together and recurse
    const digitSum = num
        .toString()
        .split('')
        .map(Number)
        .reduce((a, b) => a + b, 0);

    // Recursively reduce until we get a single digit or master number
    return reduceToSingleOrMaster(digitSum);
}

function sumDigits(num: number): number {
    return num
        .toString()
        .split('')
        .map(Number)
        .reduce((a, b) => a + b, 0);
}

export function calculateLifePath(dobISO: string): LifePathResult {
    // Handle empty/invalid input
    if (!dobISO || dobISO.trim().length === 0) {
        return { number: 1, url: LIFE_PATH_URLS[1] };
    }

    // Parse YYYY-MM-DD format
    const parts = dobISO.split('-');
    if (parts.length !== 3) {
        return { number: 1, url: LIFE_PATH_URLS[1] };
    }

    const [year, month, day] = parts.map(Number);

    // Validate parsed numbers
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
        return { number: 1, url: LIFE_PATH_URLS[1] };
    }

    // Reduce month
    const reducedMonth = reduceToSingleOrMaster(month);

    // Reduce day
    const reducedDay = reduceToSingleOrMaster(day);

    // Reduce year
    const yearSum = year
        .toString()
        .split('')
        .map(Number)
        .reduce((a, b) => a + b, 0);
    const reducedYear = reduceToSingleOrMaster(yearSum);

    // Sum reduced values
    const totalSum = reducedMonth + reducedDay + reducedYear;
    const lifePathNumber = reduceToSingleOrMaster(totalSum);

    return {
        number: lifePathNumber,
        url: LIFE_PATH_URLS[lifePathNumber] || LIFE_PATH_URLS[1],
    };
}
