// Data Sources Documentation for Birth Announcement App
// All historical data sourced from authoritative government and institutional sources

export const DATA_SOURCES = {
    "Food Prices": {
        source: "U.S. Bureau of Labor Statistics (BLS.gov)",
        dataset: "Average Retail Food Prices",
        description: "Historical consumer price data for bread, eggs, milk, and other food items",
        url: "https://www.bls.gov/regions/mid-atlantic/data/averageretailfoodandenergyprices_usandmidwest_table.htm"
    },

    "Gasoline Prices": {
        source: "U.S. Energy Information Administration (EIA.gov)",
        dataset: "Petroleum Marketing Annual",
        description: "Historical retail gasoline prices by year",
        url: "https://www.eia.gov/petroleum/marketing/annual/"
    },

    "Electricity Prices": {
        source: "U.S. Energy Information Administration (EIA.gov)",
        dataset: "Annual Energy Review",
        description: "Historical residential electricity prices per kWh",
        url: "https://www.eia.gov/totalenergy/data/annual/"
    },

    "Precious Metals": {
        source: "Federal Reserve Economic Data (FRED)",
        dataset: "London Metal Exchange Historical Data",
        description: "Historical gold and silver prices per troy ounce",
        url: "https://fred.stlouisfed.org/"
    },

    "Population Data": {
        source: "U.S. Census Bureau & UN Population Division",
        dataset: "Historical Population Estimates & World Population Prospects",
        description: "US and world population by year",
        url: "https://www.census.gov/data/datasets/time-series/demo/popest/pre-1980-national.html"
    },

    "Political Data": {
        source: "National Archives & Wikipedia.org",
        dataset: "Presidential and Vice Presidential Records",
        description: "Verified historical political leadership data",
        url: "https://www.archives.gov/"
    },

    "Sports Data": {
        source: "Wikipedia.org & Official League Records",
        dataset: "MLB World Series & NFL Super Bowl Historical Records",
        description: "Championship winners by year",
        url: "https://en.wikipedia.org/"
    },

    "Music Data": {
        source: "Billboard Charts & Wikipedia.org",
        dataset: "Billboard Year-End Hot 100 Singles",
        description: "Number one songs by year",
        url: "https://en.wikipedia.org/wiki/Billboard_Year-End_Hot_100_singles"
    }
};

// Source attribution for TimeCapsule display
export function getSourceAttribution(): string {
    return `
Historical data sourced from: U.S. Bureau of Labor Statistics (BLS.gov), 
U.S. Energy Information Administration (EIA.gov), Federal Reserve Economic Data (FRED), 
U.S. Census Bureau, National Archives, and Wikipedia.org
`.trim();
}
