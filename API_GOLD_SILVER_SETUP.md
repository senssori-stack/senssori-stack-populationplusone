# Gold & Silver Price Auto-Update Setup Guide

## Overview
This document explains how to automatically fetch gold and silver prices daily at 3 AM and update your Google Sheet database.

---

## OPTION 1: Google Apps Script (RECOMMENDED)

This is the easiest solution since you already use Google Sheets!

### Step-by-Step Instructions:

#### Step 1: Open Your Google Sheet
1. Go to your Google Sheet that contains your app data
2. Click on **Extensions** in the menu bar
3. Click **Apps Script**

#### Step 2: Create the Script
1. Delete any code in the editor
2. Copy and paste this entire script:

```javascript
/**
 * Gold & Silver Price Updater
 * Runs automatically at 3 AM daily to update prices in this Google Sheet
 */

// Configuration - Update these cell references to match your sheet!
const GOLD_PRICE_CELL = 'B2';      // Cell where gold price should be written
const SILVER_PRICE_CELL = 'B3';    // Cell where silver price should be written
const SHEET_NAME = 'Prices';       // Name of the sheet tab (change if needed)

/**
 * Main function - fetches prices and updates the sheet
 */
function updateMetalPrices() {
  try {
    // Fetch gold price from GitHub dataset (free, no API key!)
    const goldPrice = fetchGoldPriceFromGitHub();
    
    // Fetch silver price from metals.live API (free, no API key!)
    const silverPrice = fetchSilverPrice();
    
    // Get the spreadsheet and sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      // If specific sheet not found, use the first sheet
      const firstSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      firstSheet.getRange(GOLD_PRICE_CELL).setValue(goldPrice);
      firstSheet.getRange(SILVER_PRICE_CELL).setValue(silverPrice);
    } else {
      sheet.getRange(GOLD_PRICE_CELL).setValue(goldPrice);
      sheet.getRange(SILVER_PRICE_CELL).setValue(silverPrice);
    }
    
    // Log success
    console.log('Prices updated successfully!');
    console.log('Gold: $' + goldPrice);
    console.log('Silver: $' + silverPrice);
    console.log('Updated at: ' + new Date().toLocaleString());
    
  } catch (error) {
    console.error('Error updating prices: ' + error.message);
  }
}

/**
 * Fetch the latest gold price from GitHub datasets
 */
function fetchGoldPriceFromGitHub() {
  const url = 'https://raw.githubusercontent.com/datasets/gold-prices/master/data/monthly.csv';
  
  try {
    const response = UrlFetchApp.fetch(url);
    const csvText = response.getContentText();
    const lines = csvText.trim().split('\n');
    
    // Get the last line (most recent price)
    const lastLine = lines[lines.length - 1];
    const [date, price] = lastLine.split(',');
    
    return parseFloat(price).toFixed(2);
  } catch (error) {
    console.error('Error fetching gold price: ' + error);
    return 2650.00; // Fallback price
  }
}

/**
 * Fetch the latest silver price from metals.live API
 */
function fetchSilverPrice() {
  const url = 'https://api.metals.live/v1/spot';
  
  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    
    // Find silver in the response
    const silver = data.find(metal => metal.metal === 'silver');
    
    if (silver && silver.price) {
      return parseFloat(silver.price).toFixed(2);
    }
    
    return 31.50; // Fallback
  } catch (error) {
    console.error('Error fetching silver price: ' + error);
    return 31.50; // Fallback price
  }
}

/**
 * Test function - run this manually to test before setting up the trigger
 */
function testPriceFetch() {
  console.log('Testing price fetch...');
  console.log('Gold price: $' + fetchGoldPriceFromGitHub());
  console.log('Silver price: $' + fetchSilverPrice());
  console.log('Test complete!');
}
```

#### Step 3: Save the Script
1. Click the **Save** icon (floppy disk) or press Ctrl+S
2. Name your project "Metal Price Updater" when prompted

#### Step 4: Test the Script
1. In the dropdown at the top, select **testPriceFetch**
2. Click the **Run** button (play icon)
3. If prompted, click **Review Permissions** and allow access
4. Check the **Execution log** at the bottom to see if prices were fetched

#### Step 5: Set Up the 3 AM Daily Trigger
1. Click the **clock icon** on the left sidebar (Triggers)
2. Click **+ Add Trigger** (bottom right)
3. Configure these settings:
   - **Choose which function to run:** `updateMetalPrices`
   - **Choose which deployment:** `Head`
   - **Select event source:** `Time-driven`
   - **Select type of time based trigger:** `Day timer`
   - **Select time of day:** `3am to 4am`
4. Click **Save**

#### Step 6: Update Your Sheet Configuration
In the script, update these values to match your sheet:
- `GOLD_PRICE_CELL` - The cell where gold price should go (e.g., 'B2')
- `SILVER_PRICE_CELL` - The cell where silver price should go (e.g., 'B3')  
- `SHEET_NAME` - The name of your sheet tab (e.g., 'Prices' or 'Data')

---

## OPTION 2: Use a Free API with Apps Script

If you want more frequent updates or different data sources:

### Free Gold/Silver APIs (No Key Required):

1. **metals.live** - `https://api.metals.live/v1/spot`
   - Free, no signup
   - Returns current spot prices

2. **GitHub datasets** - `https://raw.githubusercontent.com/datasets/gold-prices/master/data/monthly.csv`
   - Free, no signup
   - Monthly historical data going back to 1833

### Free APIs (Requires Free Signup):

1. **MetalpriceAPI** - https://metalpriceapi.com
   - 50 free requests per month
   - Sign up with email to get API key

2. **GoldAPI** - https://www.goldapi.io
   - 100 free requests per month
   - Sign up with email to get API key

---

## OPTION 3: Firebase Cloud Functions

For more advanced users who want real-time updates:

### Overview:
- Set up Firebase project
- Create a Cloud Function that runs on a schedule
- Store prices in Firestore
- App reads from Firestore

### Requirements:
- Firebase account (free tier available)
- Node.js knowledge
- More complex setup

### Basic Cloud Function Code:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.updateMetalPrices = functions.pubsub
  .schedule('0 3 * * *')  // Run at 3 AM daily
  .timeZone('America/New_York')
  .onRun(async (context) => {
    
    // Fetch prices (similar to Apps Script code)
    const goldPrice = await fetchGoldPrice();
    const silverPrice = await fetchSilverPrice();
    
    // Save to Firestore
    await admin.firestore().collection('prices').doc('metals').set({
      gold: goldPrice,
      silver: silverPrice,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Prices updated!');
    return null;
  });
```

---

## TROUBLESHOOTING

### Apps Script Issues:

**"Authorization required" error:**
- Click "Review Permissions"
- Choose your Google account
- Click "Advanced" then "Go to Metal Price Updater (unsafe)"
- Click "Allow"

**Prices not updating:**
- Check the Execution log for errors
- Verify cell references match your sheet
- Make sure the sheet name is correct

**Trigger not running:**
- Check Triggers page for errors
- Google may delay triggers by a few minutes
- Check your quota (free accounts have limits)

### API Issues:

**GitHub CSV not loading:**
- URL: https://raw.githubusercontent.com/datasets/gold-prices/master/data/monthly.csv
- Check if GitHub is accessible

**metals.live not responding:**
- This API may have occasional downtime
- The script has fallback values

---

## SUMMARY

| Option | Difficulty | Cost | Best For |
|--------|-----------|------|----------|
| Google Apps Script | Easy | Free | Your current setup! |
| Paid API | Medium | $10-50/mo | Real-time prices |
| Firebase Functions | Hard | Free tier | Advanced users |

**Recommendation:** Start with Option 1 (Google Apps Script) since it integrates perfectly with your existing Google Sheets setup and requires no additional accounts or costs.

---

## CONTACT / RESOURCES

- GitHub Gold Prices Dataset: https://github.com/datasets/gold-prices
- metals.live API: https://metals.live
- MetalpriceAPI: https://metalpriceapi.com
- GoldAPI: https://www.goldapi.io
- Google Apps Script Docs: https://developers.google.com/apps-script

---

*Document created: January 2026*
*For: Birth Announcement Studio App*
