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
            console.log('🔄 Fetching daily snapshots...');

            const [metals, dow, song, movie] = await Promise.all([
                fetchMetals(),
                fetchDowJones(),
                fetchTopSong(),
                fetchTopMovie(),
            ]);

            const today = new Date().toISOString().split('T')[0];
            const docPath = `snapshots/${today}`;

            await db.doc(docPath).set({
                gold_usd: metals.gold,
                silver_usd: metals.silver,
                dow_jones: dow,
                top_song: song,
                top_movie: movie,
                fetchedAt: admin.firestore.Timestamp.now(),
                source: 'auto-fetch',
            });

            console.log('✅ Daily snapshot stored:', { metals, dow, song, movie });
            return 'Success';
        } catch (error) {
            console.error('❌ Error:', error);
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
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&region=US`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const movie = json.results[0];
                    resolve(movie.title);
                } catch (e) {
                    console.warn('Movie error:', e);
                    resolve('Unknown Movie');
                }
            });
        }).on('error', reject);
    });
}
