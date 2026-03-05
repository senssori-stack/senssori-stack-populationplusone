const functions = require('firebase-functions');
const admin = require('firebase-admin');
const https = require('https');
const Stripe = require('stripe').default;

admin.initializeApp();
const db = admin.firestore();

// Stripe (secret key — set via: firebase functions:config:set stripe.secret="sk_test_...")
// For local dev, set STRIPE_SECRET_KEY env variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || (functions.config().stripe && functions.config().stripe.secret) || '', {
    apiVersion: '2024-12-18.acacia',
});

// ==========================================
// STRIPE PAYMENT INTENT — one-time payments
// ==========================================
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    try {
        const { amount, currency = 'usd', orderId, customerEmail } = data;

        // Validate amount (in cents)
        if (!amount || amount < 50) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Amount must be at least $0.50 (50 cents).'
            );
        }

        // Create the PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // already in cents from client
            currency,
            metadata: {
                orderId: orderId || '',
                customerEmail: customerEmail || '',
                app: 'PopulationPlusOne',
            },
            automatic_payment_methods: { enabled: true },
        });

        console.log('✅ PaymentIntent created:', paymentIntent.id, 'amount:', amount);

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    } catch (error) {
        console.error('❌ PaymentIntent error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

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

// TEMPORARY (Feb 2026): Using GoldPrice.org (free, unlimited, no API key)
// instead of MetalsPriceAPI which was being over-fetched beyond quota.
// When ready to switch back, replace the URL and parsing logic below.
async function fetchMetals() {
    // PRIMARY: GoldPrice.org (free, unlimited)
    try {
        return await new Promise((resolve, reject) => {
            https.get('https://data-asg.goldprice.org/dbXRates/USD', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const item = json.items?.[0];
                        if (item?.xauPrice && item?.xagPrice) {
                            resolve({
                                gold: item.xauPrice.toFixed(2),
                                silver: item.xagPrice.toFixed(2),
                            });
                        } else {
                            console.warn('GoldPrice.org response missing prices, using fallback');
                            resolve({ gold: 2050, silver: 25 });
                        }
                    } catch (e) {
                        console.warn('GoldPrice.org parse error:', e);
                        resolve({ gold: 2050, silver: 25 });
                    }
                });
            }).on('error', (e) => {
                console.warn('GoldPrice.org fetch error:', e);
                resolve({ gold: 2050, silver: 25 });
            });
        });
    } catch (e) {
        console.warn('Metals fetch failed:', e);
        return { gold: 2050, silver: 25 };
    }

    // OLD MetalsPriceAPI code (disabled — was over-fetching quota)
    // Uncomment when ready to re-enable with proper rate limiting:
    /*
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
    */
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
    // Primary: Scrape Box Office Mojo for the actual #1 box office movie
    try {
        const title = await fetchFromBoxOfficeMojo();
        if (title) {
            console.log('✅ #1 Movie from Box Office Mojo:', title);
            return title;
        }
    } catch (e) {
        console.warn('⚠️ Box Office Mojo scrape failed, trying TMDb fallback:', e.message);
    }

    // Fallback: TMDb now_playing sorted by popularity
    try {
        const title = await fetchFromTMDb();
        if (title) {
            console.log('⚠️ #1 Movie from TMDb fallback:', title);
            return title;
        }
    } catch (e) {
        console.warn('⚠️ TMDb fallback also failed:', e.message);
    }

    return 'Unknown Movie';
}

// Scrape Box Office Mojo weekend summary for the actual #1 box office movie
function fetchFromBoxOfficeMojo() {
    return new Promise((resolve, reject) => {
        const url = 'https://www.boxofficemojo.com/weekend/';
        const options = {
            hostname: 'www.boxofficemojo.com',
            path: '/weekend/',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; PopulationPlusOne/1.0)',
                'Accept': 'text/html',
            },
        };
        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    // Box Office Mojo weekend summary page has rows like:
                    // <td>...date...</td> ... <td><a href="...">Movie Title</a></td>
                    // The #1 Release is the 7th column in each weekend row
                    // We look for the first row that has actual gross data (not future weekends)

                    // Find all weekend table rows with gross data and #1 release links
                    // Pattern: look for rows with dollar amounts followed by a movie title link
                    const rowPattern = /\$[\d,]+[\s\S]*?<td[^>]*>\s*<a[^>]*href="\/release[^"]*"[^>]*>([^<]+)<\/a>\s*<\/td>/gi;
                    const matches = [...data.matchAll(rowPattern)];

                    if (matches.length > 0) {
                        // First match is the most recent weekend with data
                        const movieTitle = matches[0][1].trim();
                        if (movieTitle && movieTitle !== '-') {
                            resolve(movieTitle);
                            return;
                        }
                    }

                    // Alternative: parse the specific weekend detail page pattern
                    // Look for the #1 Release column in the summary table
                    const altPattern = /<a[^>]*href="\/weekend\/\d{4}W\d+[^"]*"[^>]*>[^<]*<\/a>[\s\S]*?<td[^>]*>\s*<a[^>]*href="\/release[^"]*"[^>]*>([^<]+)<\/a>/gi;
                    const altMatches = [...data.matchAll(altPattern)];

                    if (altMatches.length > 0) {
                        const movieTitle = altMatches[0][1].trim();
                        if (movieTitle && movieTitle !== '-') {
                            resolve(movieTitle);
                            return;
                        }
                    }

                    console.warn('⚠️ Could not parse #1 movie from Box Office Mojo HTML');
                    resolve(null);
                } catch (e) {
                    console.warn('Box Office Mojo parse error:', e);
                    resolve(null);
                }
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
}

// TMDb fallback: now_playing sorted by popularity
function fetchFromTMDb() {
    return new Promise((resolve, reject) => {
        const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&region=US&language=en-US&page=1`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const movies = json.results || [];
                    movies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                    const movie = movies[0];
                    resolve(movie ? movie.title : null);
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', reject);
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

