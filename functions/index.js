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

// ==========================================
// WEDDING RSVP — Create wedding & manage RSVPs
// ==========================================

/**
 * createWedding — Called when couple generates wedding postcards
 * Creates a Firestore document for the wedding with RSVP collection
 */
exports.createWedding = functions.https.onCall(async (data, context) => {
    try {
        const { coupleName, weddingDate, venue, hometown, theme } = data;

        if (!coupleName) {
            throw new functions.https.HttpsError('invalid-argument', 'Couple name is required.');
        }

        // Generate a unique wedding ID
        const weddingId = `wedding-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        await db.collection('weddings').doc(weddingId).set({
            coupleName,
            weddingDate: weddingDate || '',
            venue: venue || '',
            hometown: hometown || '',
            theme: theme || 'gold',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log('✅ Wedding created:', weddingId, 'for', coupleName);

        return {
            weddingId,
            rsvpLink: `https://populationplusone.com/rsvp/${weddingId}`,
        };
    } catch (error) {
        console.error('❌ createWedding error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * getWeddingRSVPs — Retrieve all RSVPs for a wedding
 */
exports.getWeddingRSVPs = functions.https.onCall(async (data, context) => {
    try {
        const { weddingId } = data;

        if (!weddingId) {
            throw new functions.https.HttpsError('invalid-argument', 'Wedding ID is required.');
        }

        const rsvpSnapshot = await db.collection('weddings').doc(weddingId).collection('rsvps').get();
        const rsvps = rsvpSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return { rsvps };
    } catch (error) {
        console.error('❌ getWeddingRSVPs error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// ==========================================
// GENERIC EVENT RSVP — Birthday, Baby Shower, etc.
// ==========================================

/**
 * createEvent — Called when host generates an event postcard (birthday, baby shower, etc.)
 */
exports.createEvent = functions.https.onCall(async (data, context) => {
    try {
        const { eventType, honoree, hostName, eventDate, hometown, theme } = data;

        if (!honoree) {
            throw new functions.https.HttpsError('invalid-argument', 'Honoree name is required.');
        }

        const prefix = eventType === 'birthday' ? 'bday' : eventType === 'wedding' ? 'wedding' : 'event';
        const eventId = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        await db.collection('events').doc(eventId).set({
            eventType: eventType || 'celebration',
            honoree,
            hostName: hostName || '',
            eventDate: eventDate || '',
            hometown: hometown || '',
            theme: theme || 'green',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log('✅ Event created:', eventId, 'type:', eventType, 'for', honoree);

        return {
            eventId,
            rsvpLink: `https://populationplusone.com/rsvp/${eventId}`,
        };
    } catch (error) {
        console.error('❌ createEvent error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * getEventRSVPs — Retrieve all RSVPs for any event
 */
exports.getEventRSVPs = functions.https.onCall(async (data, context) => {
    try {
        const { eventId } = data;

        if (!eventId) {
            throw new functions.https.HttpsError('invalid-argument', 'Event ID is required.');
        }

        const rsvpSnapshot = await db.collection('events').doc(eventId).collection('rsvps').get();
        const rsvps = rsvpSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return { rsvps };
    } catch (error) {
        console.error('❌ getEventRSVPs error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// API Keys
const METAL_PRICE_API_KEY = 'b11a31e0534e4f7d0ce7f52262cfa644';
const ALPHA_VANTAGE_API_KEY = '8NT72TK4I1W8CNWY';
const LASTFM_API_KEY = 'dac11fa9b12d7418fa7cf062e93f2391';
const TMDB_API_KEY = '3dd040c35b40b0652e8750d74dc30a64';
const EIA_API_KEY = 'qwNCLcWq2VDKaOSfCBITUFjWXtQEdZbnIqLXkZ4e';

// Load the most recent snapshot from Firestore to use as fallback data
async function getLastSnapshot() {
    try {
        const snapshotsRef = db.collection('snapshots');
        const query = snapshotsRef.orderBy('fetchedAt', 'desc').limit(1);
        const snap = await query.get();
        if (!snap.empty) {
            const data = snap.docs[0].data();
            console.log('📦 Loaded last snapshot as fallback:', snap.docs[0].id);
            return data;
        }
    } catch (e) {
        console.warn('⚠️ Could not load last snapshot for fallback:', e);
    }
    return null;
}

exports.fetchDailySnapshots = functions.pubsub
    .topic('fetch-daily-snapshots')
    .onPublish(async (message) => {
        try {
            console.log('🔄 Fetching daily snapshots - all data sources...');

            // Load last snapshot as fallback for any failed fetches
            const prev = await getLastSnapshot() || {};

            // Fetch all data in parallel for speed
            const [metals, dow, song, movie, gas, populations, groceries] = await Promise.all([
                fetchMetals(),
                fetchDowJones(),
                fetchTopSong(),
                fetchTopMovie(),
                fetchGasPrice(),
                fetchPopulations(),
                fetchGroceryPrices(),
            ]);

            const today = new Date().toISOString().split('T')[0];
            const docPath = `snapshots/${today}`;

            // Store snapshot — use fresh data, fall back to previous snapshot
            await db.doc(docPath).set({
                // Market Data
                gold_price: metals.gold ? `$${metals.gold}` : (prev.gold_price || '$2,050.00'),
                silver_price: metals.silver ? `$${metals.silver}` : (prev.silver_price || '$25.00'),
                dow_jones: dow || prev.dow_jones || 43500,

                // Entertainment
                top_song: song || prev.top_song || 'Unknown Track',
                top_movie: movie || prev.top_movie || 'Unknown Movie',

                // Auto-fetched (null = fetch failed, use previous)
                gas_price: gas || prev.gas_price || '$3.15',
                us_population: populations.us || prev.us_population || '340,000,000',
                world_population: populations.world || prev.world_population || '8,200,000,000',
                bread_price: groceries.bread || prev.bread_price || '$2.50',
                eggs_price: groceries.eggs || prev.eggs_price || '$3.75',
                milk_price: groceries.milk || prev.milk_price || '$3.89',

                // Static data (update manually in Firebase Console)
                minimum_wage: prev.minimum_wage || '$7.25',
                superbowl_champ: prev.superbowl_champ || 'Philadelphia Eagles (LIX)',
                world_series_champ: prev.world_series_champ || 'Los Angeles Dodgers',
                president: 'Donald Trump',
                vice_president: 'JD Vance',

                // Metadata
                fetchedAt: admin.firestore.Timestamp.now(),
                source: 'cloud-function-auto',
            });

            console.log('✅ Comprehensive daily snapshot stored:', { metals, dow, song, movie, gas, populations, groceries });
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
    // Primary: Scrape Billboard Hot 100 #1
    try {
        const title = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'www.billboard.com',
                path: '/charts/hot-100/',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html',
                },
            };
            https.get(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const titleMatch = data.match(/<li[^>]*class="[^"]*o-chart-results-list__item[^"]*"[^>]*>[\s\S]*?<h3[^>]*id="title-of-a-story"[^>]*>\s*([^<]+)\s*<\/h3>/i);
                        const artistMatch = data.match(/<li[^>]*class="[^"]*o-chart-results-list__item[^"]*"[^>]*>[\s\S]*?<h3[^>]*id="title-of-a-story"[^>]*>[^<]*<\/h3>\s*<span[^>]*>\s*([^<]+)\s*<\/span>/i);
                        if (titleMatch && titleMatch[1]) {
                            const song = titleMatch[1].trim();
                            const artist = artistMatch && artistMatch[1] ? artistMatch[1].trim() : '';
                            const result = artist ? `${song} - ${artist}` : song;
                            console.log('🎵 Billboard #1:', result);
                            resolve(result);
                        } else {
                            resolve(null);
                        }
                    } catch (e) {
                        resolve(null);
                    }
                });
            }).on('error', () => resolve(null));
        });
        if (title) return title;
    } catch (e) {
        console.warn('⚠️ Billboard scrape failed:', e);
    }

    // Fallback: Last.fm
    return new Promise((resolve) => {
        const url = `http://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const track = json.tracks?.track?.[0];
                    resolve(`${track.name} - ${track.artist.name}`);
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
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

// EIA API — Weekly U.S. Regular Conventional Retail Gasoline Prices
async function fetchGasPrice() {
    return new Promise((resolve) => {
        const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[series][]=EMM_EPMRU_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&length=1`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const price = json.response.data[0].value;
                    const formatted = '$' + Number(price).toFixed(2);
                    console.log('⛽ Gas price from EIA:', formatted);
                    resolve(formatted);
                } catch (e) {
                    console.warn('⚠️ EIA gas API parse error:', e);
                    resolve(null);
                }
            });
        }).on('error', (e) => {
            console.warn('⚠️ EIA gas API fetch error:', e);
            resolve(null);
        });
    });
}

// U.S. Census Bureau — US + World Population Clocks
async function fetchPopulations() {
    // US Population from Census Pop Clock
    const usPromise = new Promise((resolve) => {
        https.get('https://api.census.gov/data/2021/pep/natmonthly?get=POP&for=us:*&MONTHLY=13', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pop = parseInt(json[1][0]);
                    const yearsFromBase = new Date().getFullYear() - 2021;
                    const estimated = Math.round(pop * Math.pow(1.005, yearsFromBase));
                    console.log('🇺🇸 US Population:', estimated.toLocaleString('en-US'));
                    resolve(estimated.toLocaleString('en-US'));
                } catch (e) {
                    console.warn('⚠️ Census US pop parse error:', e);
                    resolve(null);
                }
            });
        }).on('error', (e) => {
            console.warn('⚠️ Census US pop fetch error:', e);
            resolve(null);
        });
    });

    // World Population from Census International Database
    const worldPromise = new Promise((resolve) => {
        const year = new Date().getFullYear();
        https.get(`https://api.census.gov/data/timeseries/idb/1year?get=POP&YR=${year}&NAME=World`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pop = parseInt(json[1][0]);
                    console.log('🌍 World Population:', pop.toLocaleString('en-US'));
                    resolve(pop.toLocaleString('en-US'));
                } catch (e) {
                    console.warn('⚠️ Census world pop parse error:', e);
                    resolve(null);
                }
            });
        }).on('error', (e) => {
            console.warn('⚠️ Census world pop fetch error:', e);
            resolve(null);
        });
    });

    const [us, world] = await Promise.all([usPromise, worldPromise]);
    return { us, world };
}

// BLS (Bureau of Labor Statistics) — Average grocery prices
// Bread: APU0000702111 (White bread, per lb)
// Eggs: APU0000708111 (Grade A large, per dozen)
// Milk: APU0000709112 (Whole, per gallon)
async function fetchGroceryPrices() {
    return new Promise((resolve) => {
        const payload = JSON.stringify({
            seriesid: ['APU0000702111', 'APU0000708111', 'APU0000709112'],
            latest: true,
        });

        const options = {
            hostname: 'api.bls.gov',
            path: '/publicAPI/v2/timeseries/data/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const results = {};
                    const seriesMap = {
                        'APU0000702111': 'bread',
                        'APU0000708111': 'eggs',
                        'APU0000709112': 'milk',
                    };

                    for (const series of json.Results.series) {
                        const key = seriesMap[series.seriesID];
                        const latestValue = series.data[0]?.value;
                        if (key && latestValue) {
                            results[key] = '$' + Number(latestValue).toFixed(2);
                            console.log(`🛒 ${key}: $${latestValue}`);
                        }
                    }

                    resolve({
                        bread: results.bread || null,
                        eggs: results.eggs || null,
                        milk: results.milk || null,
                    });
                } catch (e) {
                    console.warn('⚠️ BLS grocery parse error:', e);
                    resolve({ bread: null, eggs: null, milk: null });
                }
            });
        });

        req.on('error', (e) => {
            console.warn('⚠️ BLS grocery fetch error:', e);
            resolve({ bread: null, eggs: null, milk: null });
        });

        req.write(payload);
        req.end();
    });
}

// HTTP endpoint for manual trigger (for testing)
exports.manualFetchSnapshot = functions.https.onRequest(async (req, res) => {
    try {
        console.log('🔄 Manual snapshot fetch triggered via HTTP');

        // Load last snapshot as fallback
        const prev = await getLastSnapshot() || {};

        const [metals, dow, song, movie, gas, populations, groceries] = await Promise.all([
            fetchMetals(),
            fetchDowJones(),
            fetchTopSong(),
            fetchTopMovie(),
            fetchGasPrice(),
            fetchPopulations(),
            fetchGroceryPrices(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const docPath = `snapshots/${today}`;

        const snapshotData = {
            // Market Data
            gold_price: metals.gold ? `$${metals.gold}` : (prev.gold_price || '$2,050.00'),
            silver_price: metals.silver ? `$${metals.silver}` : (prev.silver_price || '$25.00'),
            dow_jones: dow || prev.dow_jones || 43500,

            // Entertainment
            top_song: song || prev.top_song || 'Unknown Track',
            top_movie: movie || prev.top_movie || 'Unknown Movie',

            // Auto-fetched (null = fetch failed, use previous)
            gas_price: gas || prev.gas_price || '$3.15',
            us_population: populations.us || prev.us_population || '340,000,000',
            world_population: populations.world || prev.world_population || '8,200,000,000',
            bread_price: groceries.bread || prev.bread_price || '$2.50',
            eggs_price: groceries.eggs || prev.eggs_price || '$3.75',
            milk_price: groceries.milk || prev.milk_price || '$3.89',

            // Static data (carried from previous snapshot)
            minimum_wage: prev.minimum_wage || '$7.25',
            superbowl_champ: prev.superbowl_champ || 'Philadelphia Eagles (LIX)',
            world_series_champ: prev.world_series_champ || 'Los Angeles Dodgers',
            president: 'Donald Trump',
            vice_president: 'JD Vance',

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

