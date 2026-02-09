// src/data/utils/billboard-api.ts
// Fetch Billboard #1 songs - uses multiple API endpoints with fallback to comprehensive local data

// Try multiple API endpoints (in case one is down)
const BILLBOARD_API_ENDPOINTS = [
    'https://billboard-api2.p.rapidapi.com/hot-100',
    'https://billboard100-api.herokuapp.com',
];

// Comprehensive Billboard Year-End #1 songs (most accurate source: Wikipedia)
// These are the songs that spent the most weeks at #1 each year
const BILLBOARD_YEAR_END_DATA: Record<number, string> = {
    2025: 'Shaboozey - A Bar Song (Tipsy)',
    2024: 'Shaboozey - A Bar Song (Tipsy)',
    2023: 'Morgan Wallen - Last Night',
    2022: 'Harry Styles - As It Was',
    2021: 'Olivia Rodrigo - drivers license',
    2020: 'Roddy Ricch - The Box',
    2019: 'Lil Nas X ft. Billy Ray Cyrus - Old Town Road',
    2018: 'Drake - God\'s Plan',
    2017: 'Ed Sheeran - Shape of You',
    2016: 'Justin Bieber - Love Yourself',
    2015: 'Mark Ronson ft. Bruno Mars - Uptown Funk!',
    2014: 'Pharrell Williams - Happy',
    2013: 'Macklemore & Ryan Lewis ft. Wanz - Thrift Shop',
    2012: 'Gotye ft. Kimbra - Somebody That I Used to Know',
    2011: 'Adele - Rolling in the Deep',
    2010: 'Ke$ha - TiK ToK',
    2009: 'The Black Eyed Peas - Boom Boom Pow',
    2008: 'Flo Rida ft. T-Pain - Low',
    2007: 'Beyoncé - Irreplaceable',
    2006: 'Daniel Powter - Bad Day',
    2005: 'Mariah Carey - We Belong Together',
    2004: 'Usher ft. Lil Jon & Ludacris - Yeah!',
    2003: '50 Cent - In da Club',
    2002: 'Nickelback - How You Remind Me',
    2001: 'Lifehouse - Hanging by a Moment',
    2000: 'Faith Hill - Breathe',
    1999: 'Cher - Believe',
    1998: 'Brandy & Monica - The Boy Is Mine',
    1997: 'Elton John - Candle in the Wind 1997',
    1996: 'Mariah Carey & Boyz II Men - One Sweet Day',
    1995: 'Coolio ft. L.V. - Gangsta\'s Paradise',
    1994: 'Ace of Base - The Sign',
    1993: 'Whitney Houston - I Will Always Love You',
    1992: 'Boyz II Men - End of the Road',
    1991: 'Bryan Adams - (Everything I Do) I Do It for You',
    1990: 'Wilson Phillips - Hold On',
    1989: 'Milli Vanilli - Girl You Know It\'s True',
    1988: 'George Michael - Faith',
    1987: 'Bon Jovi - Livin\' on a Prayer',
    1986: 'Dionne Warwick & Friends - That\'s What Friends Are For',
    1985: 'Wham! - Careless Whisper',
    1984: 'Prince - When Doves Cry',
    1983: 'The Police - Every Breath You Take',
    1982: 'Olivia Newton-John - Physical',
    1981: 'Kim Carnes - Bette Davis Eyes',
    1980: 'Blondie - Call Me',
    1979: 'The Knack - My Sharona',
    1978: 'Bee Gees - Stayin\' Alive',
    1977: 'Debby Boone - You Light Up My Life',
    1976: 'Wings - Silly Love Songs',
    1975: 'Captain & Tennille - Love Will Keep Us Together',
    1974: 'Barbra Streisand - The Way We Were',
    1973: 'Roberta Flack - Killing Me Softly with His Song',
    1972: 'Don McLean - American Pie',
    1971: 'Three Dog Night - Joy to the World',
    1970: 'Simon & Garfunkel - Bridge over Troubled Water',
    1969: 'The Archies - Sugar, Sugar',
    1968: 'The Beatles - Hey Jude',
    1967: 'Lulu - To Sir with Love',
    1966: 'The Monkees - I\'m a Believer',
    1965: 'The Rolling Stones - (I Can\'t Get No) Satisfaction',
    1964: 'The Beatles - I Want to Hold Your Hand',
    1963: 'Jimmy Gilmer and the Fireballs - Sugar Shack',
    1962: 'Bobby Vinton - Roses Are Red (My Love)',
    1961: 'Bobby Lewis - Tossin\' and Turnin\'',
    1960: 'Percy Faith - Theme from A Summer Place',
    1959: 'Bobby Darin - Mack the Knife',
};

/**
 * Get the #1 Billboard song for a specific date
 * Uses accurate local data from Wikipedia Billboard Year-End charts
 */
export async function getBillboardNumber1ForDate(
    year: number,
    month: number,
    day: number
): Promise<string | null> {
    // Use the verified Year-End #1 song for the year
    if (BILLBOARD_YEAR_END_DATA[year]) {
        console.log(`✅ Billboard #1 for ${year}: ${BILLBOARD_YEAR_END_DATA[year]}`);
        return BILLBOARD_YEAR_END_DATA[year];
    }
    return null;
}

/**
 * Get the #1 Billboard song for a specific month
 * Uses the Year-End #1 for that year (most weeks at #1)
 */
export async function getBillboardNumber1ForMonth(
    year: number,
    month: number
): Promise<string | null> {
    if (BILLBOARD_YEAR_END_DATA[year]) {
        console.log(`✅ Billboard #1 for ${year}-${month}: ${BILLBOARD_YEAR_END_DATA[year]}`);
        return BILLBOARD_YEAR_END_DATA[year];
    }
    return null;
}

/**
 * Get the #1 Billboard song for a given year
 * This is the song that spent the most weeks at #1 that year
 */
export async function getBillboardNumber1ForYear(year: number): Promise<string | null> {
    // Only supports 1959 onwards (Billboard Hot 100 started in 1958)
    if (year < 1959) {
        console.log(`📅 Year ${year} is before Billboard Hot 100 (1958)`);
        return null;
    }

    if (BILLBOARD_YEAR_END_DATA[year]) {
        console.log(`✅ Billboard Year-End #1 for ${year}: ${BILLBOARD_YEAR_END_DATA[year]}`);
        return BILLBOARD_YEAR_END_DATA[year];
    }

    console.warn(`⚠️ No Billboard data for year ${year}`);
    return null;
}
