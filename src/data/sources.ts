// src/data/sources.ts
// Comprehensive list of all data sources for the app

export interface DataSource {
    field: string;
    source: string;
    url?: string;
    updateFrequency: string;
    notes?: string;
    category: 'prices' | 'markets' | 'population' | 'government' | 'entertainment' | 'sports';
}

export const DATA_SOURCES: DataSource[] = [
    // PRICES
    {
        field: 'Gallon of Gasoline',
        source: 'AAA Gas Prices',
        url: 'https://gasprices.aaa.com/',
        updateFrequency: 'Daily',
        notes: 'National average retail gasoline prices, regular grade',
        category: 'prices'
    },
    {
        field: 'Loaf of Bread',
        source: 'Bureau of Labor Statistics (BLS)',
        url: 'https://www.bls.gov/charts/consumer-price-index/consumer-price-index-average-price-data.htm',
        updateFrequency: 'Monthly',
        notes: 'Consumer Price Index average prices',
        category: 'prices'
    },
    {
        field: 'Dozen Eggs',
        source: 'Bureau of Labor Statistics (BLS)',
        url: 'https://www.bls.gov/charts/consumer-price-index/consumer-price-index-average-price-data.htm',
        updateFrequency: 'Monthly',
        notes: 'Consumer Price Index average prices, Grade A large',
        category: 'prices'
    },
    {
        field: 'Gallon of Milk',
        source: 'Bureau of Labor Statistics (BLS)',
        url: 'https://www.bls.gov/charts/consumer-price-index/consumer-price-index-average-price-data.htm',
        updateFrequency: 'Monthly',
        notes: 'Consumer Price Index average prices, whole milk',
        category: 'prices'
    },
    {
        field: 'Minimum Wage',
        source: 'U.S. Department of Labor',
        url: 'https://www.dol.gov/agencies/whd/minimum-wage',
        updateFrequency: 'As enacted',
        notes: 'Federal minimum wage and state-specific rates',
        category: 'prices'
    },

    // MARKETS
    {
        field: 'Gold Price (per oz)',
        source: 'Kitco',
        url: 'https://www.kitco.com/charts/historicalgold.html',
        updateFrequency: 'Real-time',
        notes: 'Spot price per troy ounce in USD',
        category: 'markets'
    },
    {
        field: 'Silver Price (per oz)',
        source: 'Kitco',
        url: 'https://www.kitco.com/charts/historicalsilver.html',
        updateFrequency: 'Real-time',
        notes: 'Spot price per troy ounce in USD',
        category: 'markets'
    },
    {
        field: 'Dow Jones Industrial Average',
        source: 'MarketWatch',
        url: 'https://www.marketwatch.com/investing/index/djia',
        updateFrequency: 'Real-time (market hours)',
        notes: 'Daily closing price',
        category: 'markets'
    },

    // POPULATION
    {
        field: 'U.S. Population',
        source: 'U.S. Census Bureau',
        url: 'https://www.census.gov/popclock/',
        updateFrequency: 'Real-time estimate',
        notes: 'Population Clock estimates based on birth, death, and migration rates',
        category: 'population'
    },
    {
        field: 'World Population',
        source: 'U.S. Census Bureau / Worldometer',
        url: 'https://www.worldometers.info/world-population/',
        updateFrequency: 'Real-time estimate',
        notes: 'Based on UN population projections',
        category: 'population'
    },
    {
        field: 'City Population',
        source: 'U.S. Census Bureau',
        url: 'https://www.census.gov/data.html',
        updateFrequency: 'Decennial Census / Annual Estimates',
        notes: 'City and place population estimates, interpolated for years between census',
        category: 'population'
    },

    // GOVERNMENT
    {
        field: 'U.S. President',
        source: 'USA.gov',
        url: 'https://www.usa.gov/presidents',
        updateFrequency: 'As inaugurated (Jan 20)',
        notes: 'Official presidential records',
        category: 'government'
    },
    {
        field: 'U.S. Vice President',
        source: 'USA.gov',
        url: 'https://www.usa.gov/presidents',
        updateFrequency: 'As inaugurated (Jan 20)',
        notes: 'Official vice presidential records',
        category: 'government'
    },
    {
        field: 'State Governor',
        source: 'National Governors Association',
        url: 'https://www.nga.org/governors/',
        updateFrequency: 'As inaugurated',
        notes: 'Current and historical governors by state',
        category: 'government'
    },

    // ENTERTAINMENT
    {
        field: '#1 Song',
        source: 'Billboard Hot 100',
        url: 'https://www.billboard.com/charts/hot-100/',
        updateFrequency: 'Weekly (Tuesday)',
        notes: 'Billboard Hot 100 #1 position for the week',
        category: 'entertainment'
    },
    {
        field: '#1 Movie',
        source: 'TMDb (The Movie Database)',
        url: 'https://www.themoviedb.org/',
        updateFrequency: 'Daily (auto-fetched)',
        notes: '#1 currently playing movie in US theaters',
        category: 'entertainment'
    },

    // SPORTS CHAMPIONS
    {
        field: 'Super Bowl Champion',
        source: 'ESPN.com',
        url: 'https://www.espn.com/nfl/superbowl/history/winners',
        updateFrequency: 'Annually (February)',
        notes: 'Most recent Super Bowl winner',
        category: 'sports'
    },
    {
        field: 'World Series Champion',
        source: 'ESPN.com',
        url: 'https://www.espn.com/mlb/worldseries/history/winners',
        updateFrequency: 'Annually (October/November)',
        notes: 'Most recent World Series winner',
        category: 'sports'
    },
];

// Historical data sources (for THEN section)
export const HISTORICAL_SOURCES: DataSource[] = [
    {
        field: 'Historical Gas Prices',
        source: 'AAA Gas Prices',
        url: 'https://gasprices.aaa.com/',
        updateFrequency: 'Historical archive',
        notes: 'National average gas price history',
        category: 'prices'
    },
    {
        field: 'Historical Consumer Prices',
        source: 'Bureau of Labor Statistics (BLS)',
        url: 'https://www.bls.gov/charts/consumer-price-index/consumer-price-index-average-price-data.htm',
        updateFrequency: 'Historical archive',
        notes: 'CPI historical tables for bread, eggs, milk',
        category: 'prices'
    },
    {
        field: 'Historical Gold/Silver',
        source: 'Kitco',
        url: 'https://www.kitco.com/charts/historicalgold.html',
        updateFrequency: 'Historical archive',
        notes: 'Monthly/annual spot prices',
        category: 'markets'
    },
    {
        field: 'Historical Dow Jones',
        source: 'Macrotrends / Yahoo Finance',
        url: 'https://www.macrotrends.net/1319/dow-jones-100-year-historical-chart',
        updateFrequency: 'Historical archive',
        notes: 'Daily close prices since 1914',
        category: 'markets'
    },
    {
        field: 'Historical Population',
        source: 'U.S. Census Bureau',
        url: 'https://www.census.gov/population/www/censusdata/pop1790-1990.html',
        updateFrequency: 'Decennial Census',
        notes: 'Census counts from 1790, estimates for intercensal years',
        category: 'population'
    },
    {
        field: 'Historical #1 Songs',
        source: 'Billboard Hot 100 Archives',
        url: 'https://www.billboard.com/charts/hot-100/',
        updateFrequency: 'Weekly since 1958',
        notes: 'Billboard Hot 100 launched August 4, 1958',
        category: 'entertainment'
    },
    {
        field: 'Historical #1 Movies',
        source: 'TMDb (The Movie Database)',
        url: 'https://www.themoviedb.org/',
        updateFrequency: 'Historical archive',
        notes: 'Movie popularity and theatrical release data',
        category: 'entertainment'
    },
    {
        field: 'Historical Presidents/VPs',
        source: 'The White House Historical Association',
        url: 'https://www.whitehousehistory.org/',
        updateFrequency: 'Historical archive',
        notes: 'Complete presidential and vice presidential history',
        category: 'government'
    },
    {
        field: 'Super Bowl History',
        source: 'ESPN.com',
        url: 'https://www.espn.com/nfl/superbowl/history/winners',
        updateFrequency: 'Historical archive',
        notes: 'All Super Bowl winners since 1967',
        category: 'sports'
    },
    {
        field: 'World Series History',
        source: 'ESPN.com',
        url: 'https://www.espn.com/mlb/worldseries/history/winners',
        updateFrequency: 'Historical archive',
        notes: 'All World Series winners since 1903',
        category: 'sports'
    },
];

// Category display labels
export const CATEGORY_LABELS: Record<string, string> = {
    prices: 'Consumer Prices',
    markets: 'Financial Markets',
    population: 'Population Data',
    government: 'Government Officials',
    entertainment: 'Entertainment',
    sports: 'Sports Champions',
};

// Get sources by category
export function getSourcesByCategory(category: string): DataSource[] {
    return DATA_SOURCES.filter(s => s.category === category);
}

// Get all categories
export function getAllCategories(): string[] {
    return [...new Set(DATA_SOURCES.map(s => s.category))];
}
