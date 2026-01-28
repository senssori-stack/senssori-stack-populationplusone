# Population +1 - Google Play Store Launch Guide

## Complete Step-by-Step Instructions for Publishing to Google Play Store

---

## PHASE 1: PREREQUISITES & SETUP

### Step 1: Create a Google Play Developer Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account (create one if needed)
3. Accept the Developer Agreement and pay the **$25 one-time registration fee**
4. Complete your developer profile with:
   - Developer name
   - Contact email
   - Website (optional but recommended)
   - Store listing contact info

### Step 2: Set Up App Signing Key
1. In Google Play Console, go to **Setup → App signing**
2. Google will manage your signing key automatically (recommended)
   - Google stores the key securely
   - You only need to create an upload key
3. Download and save your **upload key** in a secure location:
   - Keep the password in a safe file
   - Do NOT share this file

**Important**: Save this key—you'll need it every time you update the app.

---

## PHASE 2: PREPARE YOUR APP

### Step 3: Update App Configuration
Open `app.json` in your project and verify:

```json
{
  "expo": {
    "name": "Population +1",
    "slug": "population-plus-one",
    "version": "1.0.0",
    "platforms": ["android"],
    "android": {
      "package": "com.yourcompany.birthannouncements",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

**Key values to set:**
- `package`: Unique identifier (e.g., `com.yourname.birthannouncements`) - MUST be unique on Play Store
- `version`: Your app version (e.g., "1.0.0")
- `versionCode`: Integer that increases with each release (1, 2, 3, etc.)

### Step 4: Prepare Icons and Graphics
You need these images:

| Asset | Size | Format | Purpose |
|-------|------|--------|---------|
| App Icon | 512×512 px | PNG | Main app icon |
| Adaptive Icon (Foreground) | 108×108 px | PNG | Icon for modern Android |
| Adaptive Icon (Background) | 108×108 px or color | PNG or solid color | Icon background |
| Feature Graphic | 1024×500 px | PNG/JPG | Store listing header |
| Screenshots | 1080×1920 px | PNG/JPG | 2-8 screenshots showing app features |

Place these in `assets/` folder and reference in `app.json`.

### Step 5: Create App Store Listing Content
Prepare the following text:

- **App Title**: "Birth Announcement Studio" (50 characters max)
- **Short Description**: One-line summary (80 characters max)
  - *Example: "Create personalized birth announcements with historical data"*
- **Full Description**: Detailed explanation (4,000 characters max)
  - Highlight key features (historical facts, photo customization, etc.)
  - Mention any permissions you're requesting
  - Include any relevant disclaimers
- **Promotional Text**: Marketing message (500 characters)
- **Content Rating Questionnaire**: Answer all questions (Google will assign rating)

---

## PHASE 3: BUILD RELEASE APK/AAB

### Step 6: Build for Production (Cloud Build)
Run this command in your project directory:

```bash
eas build -p android --release
```

**What happens:**
- EAS builds your app on their secure servers
- The build is signed with your upload key
- You'll get a download link when complete (takes 5-10 minutes)

**Output**: You'll receive an **AAB file** (Android App Bundle) - this is what Google Play Store requires.

**Alternative**: If you need an APK instead of AAB, add the flag:
```bash
eas build -p android --release --output-format apk
```

### Step 7: Download and Store Your Build
1. Go to the build link provided by EAS
2. Click **Download** to get the AAB/APK file
3. Store it in a safe folder on your computer (you may need to upload a different version later)

---

## PHASE 4: CREATE STORE LISTING

### Step 8: Create New App in Google Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Enter app details:
   - **App name**: "Population +1"
   - **Default language**: English (US)
   - **App category**: "Lifestyle" or "Photography"
   - **Type**: Select appropriate category

### Step 9: Fill in App Details
In the left sidebar, go to:

**1. Store listing**
- Upload feature graphic (1024×500 px)
- Upload 2-8 screenshots (1080×1920 px each)
- Enter all text fields from Step 5 above
- Upload app icon (512×512 px)
- Set privacy policy URL (required!)
  - Create a simple privacy policy page and host it
  - Add the URL here

**2. Pricing & distribution**
- Select **Free** (unless you want to charge)
- Choose countries where app will be available
- Agree to content guidelines

**3. Content rating**
- Complete the content rating questionnaire
- Submit for rating (Google assigns automatically)

---

## PHASE 5: UPLOAD AND PUBLISH

### Step 10: Upload Your Build
In Google Play Console:
1. Go to **Testing → Internal testing**
2. Click **Create new release**
3. Click **Browse files** and select your AAB/APK from Step 7
4. Enter **Release notes**: 
   - *"Initial release of Birth Announcement Studio"*
5. Click **Save** (NOT PUBLISH YET)

### Step 11: Test Before Publishing (Optional but Recommended)
1. In **Internal testing**, invite test users by their email addresses
2. They'll receive a link to download and test the app
3. Wait for feedback (24-48 hours)
4. Fix any critical bugs and reupload

### Step 12: Submit for Review
1. Go to **Testing → Production**
2. Click **Create new release**
3. Upload the same AAB/APK file
4. Add release notes
5. Review all app details in the sidebar
6. Click **Review release** to see a final checklist
7. Once everything is green, click **Confirm rollout**
8. Click **Start rollout to Production**

**What happens next:**
- Google reviews your app (typically 24-48 hours)
- They check for security, compliance, and quality issues
- If approved, your app appears on Google Play Store
- If rejected, you'll get an email with the reason to fix

---

## PHASE 6: AFTER PUBLISHING

### Step 13: Monitor and Update
Once live:
- Check **Analytics** for download numbers and crashes
- Monitor **Ratings & reviews** for user feedback
- Fix bugs and submit updates as AABs in **Production** release section

### Step 14: Future Updates
To update your app:
1. Update version in `app.json` (increment both `version` and `versionCode`)
2. Run: `eas build -p android --release`
3. Upload new AAB to **Production** release in Google Play Console
4. Add release notes
5. Submit for review (same process as initial)

---

## QUICK REFERENCE CHECKLIST

Before publishing, verify you have:

- [ ] Google Play Developer account ($25 fee paid)
- [ ] Upload key created and saved safely
- [ ] `app.json` configured with unique package name
- [ ] App icon (512×512 px)
- [ ] Feature graphic (1024×500 px)
- [ ] 2-8 app screenshots (1080×1920 px each)
- [ ] App title and descriptions written
- [ ] Privacy policy URL (required)
- [ ] Content rating questionnaire completed
- [ ] AAB/APK build downloaded from EAS
- [ ] App tested on real phone or emulator
- [ ] All store listing fields filled out

---

## TROUBLESHOOTING

### "Package name already exists"
- Your `package` in `app.json` is taken
- Choose a unique name: `com.yourname.birthannouncement2025`

### "App rejected due to permissions"
- You requested permissions in `AndroidManifest.xml` but don't use them
- Remove unused permissions or explain why they're needed

### "Screenshots too small"
- Must be exactly 1080×1920 px (9:16 aspect ratio)
- Use online resize tool if needed

### "Build failed to upload"
- Ensure AAB is from `eas build --release`
- Check file isn't corrupted (download again if unsure)

### "App takes too long to appear after approval"
- Google Play typically takes 24-48 hours
- Rarely takes up to 7 days
- Check console email for any issues

---

## IMPORTANT REMINDERS

1. **Test thoroughly** before submitting—users will leave bad reviews if it crashes
2. **Keep your upload key safe**—you need it for every future update
3. **Monitor ratings**—respond to user reviews, especially critical feedback
4. **Update regularly**—users prefer apps that get bug fixes and improvements
5. **Privacy policy required**—even if you don't collect data, you need a policy page

---

## SUPPORT RESOURCES

- **EAS Documentation**: [expo.dev/eas](https://expo.dev/eas)
- **Google Play Console Help**: [support.google.com/googleplay/android-developer](https://support.google.com/googleplay/android-developer)
- **App Store Guidelines**: [play.google.com/about/developer-content-policy](https://play.google.com/about/developer-content-policy)

---

**Estimated Timeline:**
- Account setup & preparation: 1-2 hours
- Build creation: 5-10 minutes
- App review: 24-48 hours
- **Total time to launch: ~1-2 days**

Good luck launching Population +1! 🎉
