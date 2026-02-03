// src/data/utils/api-keys.ts
// API Keys and credentials for external data sources
// KEEP THIS FILE SECURE - don't commit to public repos

export const API_KEYS = {
    // Metals API for gold/silver prices
    METALS_API: {
        key: 'b11a31e0534e4f7d0ce7f52262cfa644',
        baseUrl: 'https://api.metalpriceapi.com/v1',
    },

    // Alpha Vantage for Dow Jones data
    ALPHA_VANTAGE: {
        key: '8NT72TK4I1W8CNWY',
        baseUrl: 'https://www.alphavantage.co/query',
    },

    // Senssori API
    SENSSORI: {
        apiKey: 'dac11fa9b12d7418fa7cf062e93f2391',
        sharedSecret: 'd2a6d5533ac375258bd143d6534d54f8',
        baseUrl: 'https://api.senssori.com', // Update with actual endpoint
    },

    // Read Access Token (for data sources)
    READ_ACCESS_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzZGQwNDBjMzViNDBiMDY1MmU4NzUwZDc0ZGMzMGE2NCIsIm5iZiI6MTc2OTcyMDAyMi42OTUwMDAyLCJzdWIiOiI2OTdiYzhkNjc1MWQxNTg5YzM2NjZhNTAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.wpzmuQ3jipr31jMiB5S7dlgxxpLhcFMqlTMBewHB4hY',
};

export const FIREBASE_CONFIG = {
    projectId: 'populationplusone-a419c',
    projectNumber: '1024302307069',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'populationplusone-a419c.firebaseapp.com',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'populationplusone-a419c.appspot.com',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
};
