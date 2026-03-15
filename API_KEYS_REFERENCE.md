# PopulationPlusOne — API Keys & Service Accounts
## KEEP THIS FILE PRIVATE — DO NOT SHARE PUBLICLY

---

## 1. PRINTFUL (Print-on-Demand: Posters, Canvas, Yard Signs)

- **API Token**: `x1lJgXLBTh2VRkh0H9D2JjpSaIzxVJlI7477VcKg`
- **Affiliate Link**: `https://www.printful.com/a/14222995:373e81c9e7b9ea9f3e9d6b2672c7585b`
- **Dashboard**: https://www.printful.com/dashboard
- **API Docs**: https://developers.printful.com/docs/
- **Code Location**: `src/data/utils/printful-api.ts`
- **Products We Use**:
  - Posters (12×18, 18×24, 24×36) — front signs & time capsules
  - Canvas prints (8×10, 12×12, 16×20)
  - Yard signs (when available)
- **How Billing Works**: They charge YOUR credit card on file the wholesale cost when an order is placed. You set the retail price in the app and keep the difference.
- **⚠️ TO DO**: Add a credit card to your Printful billing settings before going live.

---

## 2. PRODIGI (Print-on-Demand: Postcards, Trading Cards)

- **API Key**: `fd3758c0-8519-4d80-9159-2920280a01a3`
- **Dashboard**: https://dashboard.prodigi.com
- **API Docs**: https://www.prodigi.com/print-api/docs/
- **Code Location**: `src/data/utils/prodigi-api.ts`
- **Sandbox Mode**: Currently ON (no real orders charged)
- **Products We Use**:
  - Postcards (4×6, 5×7) — announcement postcards
  - Trading Cards (2.5×3.5) — baseball/rookie cards
- **How Billing Works**: Same as Printful — they charge your account the base cost + shipping per order. You keep whatever markup you set.
- **⚠️ TO DO**: Add a payment method in your Prodigi dashboard before going live.

---

## 3. STRIPE (Payment Processing — Collects Money from Customers)

- **Publishable Key (Test)**: `pk_test_51T3LiORrqgpktGAGkYZsfCjOaP7VkXTHm7cNnOc3gupEl6uYEtjym2HU0aUOMo09tUX9M0JhZQicUGQzMkcIQKPC00DDNPETIN`
- **Secret Key**: Stored in Firebase Cloud Functions config (not in app code)
- **Dashboard**: https://dashboard.stripe.com
- **Code Location**: `src/config/stripe.ts` and `src/data/utils/api-keys.ts`
- **How It Works**: Customer pays your retail price via Stripe → money goes to your Stripe account → then Printful/Prodigi charge you separately for production.
- **⚠️ TO DO**: Switch from test key to live key (`pk_live_...`) before launch.

---

## 4. FIREBASE (Database, Cloud Functions, Auth)

- **Project ID**: `populationplusone-a419c`
- **Project Number**: `1024302307069`
- **Console**: https://console.firebase.google.com/project/populationplusone-a419c
- **Code Location**: `src/data/utils/api-keys.ts` (config), `functions/index.js` (Cloud Functions)
- **Used For**: Order storage, population data, snapshot data, Stripe payment intents

---

## 5. METALS API (Gold/Silver Prices for Time Capsule)

- **API Key**: `b11a31e0534e4f7d0ce7f52262cfa644`
- **Base URL**: `https://api.metalpriceapi.com/v1`
- **Code Location**: `src/data/utils/api-keys.ts`

---

## 6. ALPHA VANTAGE (Dow Jones Index for Time Capsule)

- **API Key**: `8NT72TK4I1W8CNWY`
- **Base URL**: `https://www.alphavantage.co/query`
- **Code Location**: `src/data/utils/api-keys.ts`

---

## 7. AFFILIATE ACCOUNTS (Earn Commission on Gift Referrals)

- **Amazon Associates**: Not yet set up (sign up at https://affiliate-program.amazon.com/)
- **Babylist**: Not yet set up
- **Etsy / Awin**: Not yet set up (sign up at https://www.awin.com/)
- **Target / Impact**: Not yet set up
- **FedEx Office**: ID = `BIRTHSTUDIO` (active)
- **Code Location**: `src/data/utils/affiliate-config.ts`

---

## MONEY FLOW SUMMARY

```
Customer creates sign in app
        ↓
Customer pays $22.99 via Stripe
        ↓
Money goes to YOUR Stripe account
        ↓
Cloud Function sends order to Printful or Prodigi
        ↓
Printful/Prodigi charges YOUR card ~$13-18
        ↓
They print, pack, and ship directly to customer
        ↓
YOUR PROFIT = $22.99 - $13-18 = ~$5-10 per order
```

---

## BEFORE GOING LIVE CHECKLIST

- [ ] Add credit card to Printful billing
- [ ] Add payment method to Prodigi billing
- [ ] Switch Stripe to live key (`pk_live_...`)
- [ ] Switch Prodigi from sandbox to production (set `USE_SANDBOX = false` in prodigi-api.ts)
- [ ] Move API keys to Firebase Cloud Functions environment config (security)
- [ ] Set up Amazon Associates account
- [ ] Set final retail prices in PrintServiceScreen
