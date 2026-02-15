const functions = require('firebase-functions');
const admin = require('firebase-admin');
const https = require('https');

admin.initializeApp();
const db = admin.firestore();

// API Keys
const METAL_PRICE_API_KEY = 'b11a31e0534e4f7d0ce7f52262cfa644';
const ALPHA_VANTAGE_API_KEY = '8NT72TK4I1W8CNWY';
const LASTFM_API_KEY = 'dac11fa9b12d7418fa7cf062e93f2391';
const TMDB_API_KEY = '3dd040c35b40b0652e8750d74dc30a64';

exports.fetchDailySnapshots = functions.pubsub
    .topic('fetch-daily-snapshots')
    .onPublish(async (message) => {
        try {
            console.log('🔄 Fetching daily snapshots - all data sources...');

            // Fetch all data in parallel for speed
            const [metals, dow, song, movie] = await Promise.all([
                fetchMetals(),
                fetchDowJones(),
                fetchTopSong(),
                fetchTopMovie(),
            ]);

            const today = new Date().toISOString().split('T')[0];
            const docPath = `snapshots/${today}`;

            // Store comprehensive snapshot with all fields
            await db.doc(docPath).set({
                // Market Data
                gold_price: `$${metals.gold}`,
                silver_price: `$${metals.silver}`,
                dow_jones: dow,

                // Entertainment
                top_song: song,
                top_movie: movie,

                // Static data (update manually in Firebase Console)
                gas_price: '$3.15',
                minimum_wage: '$7.25',
                bread_price: '$2.50',
                eggs_price: '$3.75',
                milk_price: '$3.89',
                us_population: '340,000,000',
                world_population: '8,200,000,000',
                superbowl_champ: 'Philadelphia Eagles (LIX)',
                world_series_champ: 'Los Angeles Dodgers',
                president: 'Joe Biden',
                vice_president: 'Kamala Harris',

                // Metadata
                fetchedAt: admin.firestore.Timestamp.now(),
                source: 'cloud-function-auto',
            });

            console.log('✅ Comprehensive daily snapshot stored:', { metals, dow, song, movie });
            return 'Success';
        } catch (error) {
            console.error('❌ Error fetching daily snapshots:', error);
            throw error;
        }
    });

async function fetchMetals() {
    return new Promise((resolve, reject) => {
        const url = `https://api.metalpriceapi.com/v1/latest?api_key=${METAL_PRICE_API_KEY}&base=USD&currencies=XAU,XAG`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({
                        gold: json.rates?.USDXAU || 2050,
                        silver: json.rates?.USDXAG || 25,
                    });
                } catch (e) {
                    console.warn('Metals error:', e);
                    resolve({ gold: 2050, silver: 25 });
                }
            });
        }).on('error', reject);
    });
}

async function fetchDowJones() {
    return new Promise((resolve, reject) => {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=GSPC&apikey=${ALPHA_VANTAGE_API_KEY}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const price = parseFloat(json['Global Quote']?.['05. price'] || '43500');
                    resolve(price);
                } catch (e) {
                    console.warn('Dow error:', e);
                    resolve(43500);
                }
            });
        }).on('error', reject);
    });
}

async function fetchTopSong() {
    return new Promise((resolve, reject) => {
        const url = `http://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const track = json.tracks?.track?.[0];
                    const name = `${track.name} - ${track.artist.name}`;
                    resolve(name);
                } catch (e) {
                    console.warn('Song error:', e);
                    resolve('Unknown Track');
                }
            });
        }).on('error', reject);
    });
}

async function fetchTopMovie() {
    return new Promise((resolve, reject) => {
        // Use now_playing for current theatrical releases (closest to box office #1)
        const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&region=US&language=en-US&page=1`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    // Sort by popularity descending to get the most popular currently playing movie
                    const movies = json.results || [];
                    movies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                    const movie = movies[0];
                    resolve(movie ? movie.title : 'Unknown Movie');
                } catch (e) {
                    console.warn('Movie error:', e);
                    resolve('Unknown Movie');
                }
            });
        }).on('error', (e) => {
            console.warn('Movie fetch error:', e);
            resolve('Unknown Movie');
        });
    });
}

// HTTP endpoint for manual trigger (for testing)
exports.manualFetchSnapshot = functions.https.onRequest(async (req, res) => {
    try {
        console.log('🔄 Manual snapshot fetch triggered via HTTP');

        const [metals, dow, song, movie] = await Promise.all([
            fetchMetals(),
            fetchDowJones(),
            fetchTopSong(),
            fetchTopMovie(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const docPath = `snapshots/${today}`;

        const snapshotData = {
            // Market Data
            gold_price: `$${metals.gold}`,
            silver_price: `$${metals.silver}`,
            dow_jones: dow,

            // Entertainment
            top_song: song,
            top_movie: movie,

            // Static data (update manually in Firebase Console as needed)
            gas_price: '$3.15',
            minimum_wage: '$7.25',
            bread_price: '$2.50',
            eggs_price: '$3.75',
            milk_price: '$3.89',
            us_population: '340,000,000',
            world_population: '8,200,000,000',
            superbowl_champ: 'Philadelphia Eagles (LIX)',
            world_series_champ: 'Los Angeles Dodgers',
            president: 'Joe Biden',
            vice_president: 'Kamala Harris',

            // Metadata
            fetchedAt: admin.firestore.Timestamp.now(),
            source: 'manual-http-trigger',
        };

        await db.doc(docPath).set(snapshotData);

        console.log('✅ Manual snapshot stored successfully');

        res.status(200).json({
            success: true,
            message: 'Snapshot fetched and stored successfully',
            date: today,
            data: snapshotData
        });
    } catch (error) {
        console.error('❌ Manual fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

