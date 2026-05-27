<!-- The Herb Souk™ · First Medicine™ · © 2026 Charles John · All rights reserved -->

# THE HERB SOUK — COMPLETE DEPLOYMENT GUIDE
## From files to live on App Store, Google Play, and the Web
## Charles John BSc (Hons) · The Herb Souk™

---

## OVERVIEW

You have three deployment paths. Do them in this order:

1. **Web PWA** → Deploy to herbsouk.co.uk (1–2 hours, live immediately)
2. **Google Play** → Android TWA submission (1–3 days review)  
3. **Apple App Store** → iOS via Capacitor (1–7 days review)

---

## STEP 1 — REGISTER YOUR DOMAIN

Go to: https://www.123reg.co.uk or https://www.namecheap.com

Search for: **herbsouk.co.uk**

If taken, alternatives:
- herbsouk.co.uk
- theherbsouk.co.uk
- theherbsouk.co.uk
- herbsoukapp.com

Cost: approximately £10–15/year

---

## STEP 2 — DEPLOY THE WEB PWA (Netlify — FREE)

This is the fastest path. Netlify hosts for free.

### 2a. Create Netlify account
1. Go to https://netlify.com
2. Sign up with email (free plan is sufficient)
3. Click "Add new site" → "Deploy manually"

### 2b. Upload your files
Drag and drop the entire **herbsouk-pwa** folder to Netlify.

Required files in the folder:
```
herbsouk-pwa/
├── index.html          ← main app file
├── manifest.json       ← PWA manifest
├── sw.js               ← service worker
├── privacy.html        ← privacy policy
├── netlify.toml        ← Netlify config
├── .htaccess           ← Apache config
├── favicon.ico         ← browser tab icon
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-180x180.png
    ├── icon-192x192.png
    ├── icon-256x256.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── icon-1024x1024.png
    ├── apple-splash-640x1136.png
    ├── apple-splash-750x1334.png
    ├── apple-splash-1125x2436.png
    ├── apple-splash-1242x2208.png
    ├── apple-splash-1536x2048.png
    └── apple-splash-2048x2732.png
```

### 2c. Connect your domain
1. In Netlify: Site settings → Domain management → Add custom domain
2. Enter: herbsouk.co.uk
3. Update your domain's DNS nameservers to Netlify's (shown in their dashboard)
4. Wait 24–48 hours for DNS propagation
5. Netlify auto-provisions SSL certificate (free)

### 2d. Verify the PWA
Once live, test at: https://web.dev/measure/
Enter your URL — target score: 90+ for PWA

---

## STEP 3 — GOOGLE PLAY STORE (Android)

### 3a. Create Google Play Developer account
- URL: https://play.google.com/console
- One-time fee: $25 USD (~£20)
- Requires Google account + identity verification

### 3b. Install Bubblewrap (TWA builder)
On your computer (requires Node.js 14+):

```bash
npm install -g @bubblewrap/cli
bubblewrap --version
```

If you don't have Node.js: https://nodejs.org (install LTS version)

### 3c. Generate the Android app
```bash
# Create a new folder
mkdir herbsouk-android
cd herbsouk-android

# Initialise TWA from your live PWA
bubblewrap init --manifest https://herbsouk.co.uk/manifest.json

# Follow prompts:
# Package ID: com.herbsouk.app
# App name: The Herb Souk
# Display mode: standalone
# Theme colour: #c9943a
# Background colour: #0a0600
# Start URL: /

# Build the APK
bubblewrap build
```

This generates: **app-release-signed.apk** and **app-release.aab**

### 3d. Digital Asset Links (required for TWA)
Create this file on your web server:
**URL:** https://herbsouk.co.uk/.well-known/assetlinks.json

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.herbsouk.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT_HERE"]
  }
}]
```

Get your fingerprint after signing:
```bash
keytool -list -v -keystore herbsouk.keystore
```

### 3e. Submit to Google Play
1. In Play Console: Create app → "The Herb Souk"
2. App category: Apps → Health & Fitness
3. Upload app-release.aab to Production track
4. Complete store listing using APP_STORE_LISTING.md
5. Set price: £4.99 (Payments → Monetisation → Paid app)
6. Submit for review (1–3 days)

---

## STEP 4 — APPLE APP STORE (iOS)

### 4a. Apple Developer account
- URL: https://developer.apple.com
- Annual fee: $99 USD (~£80/year)
- Requires Apple ID + identity verification (can take 24–48 hours)

### 4b. Install required tools
On a Mac (required for iOS builds):

```bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/homebrew-install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Capacitor
npm install -g @capacitor/cli @capacitor/core

# Install CocoaPods (iOS dependency manager)
sudo gem install cocoapods
```

**Note:** You MUST have a Mac with Xcode installed for iOS builds.
Xcode: Free from Mac App Store (requires macOS 13+, ~14GB download)

### 4c. Create Capacitor project
```bash
mkdir herbsouk-ios
cd herbsouk-ios

# Copy your index.html here
cp /path/to/herbsouk-pwa/index.html .
cp /path/to/herbsouk-pwa/manifest.json .
cp /path/to/herbsouk-pwa/sw.js .
cp -r /path/to/herbsouk-pwa/icons .

# Copy capacitor config
cp /path/to/herbsouk-pwa/capacitor.config.json .

# Install Capacitor
npm init -y
npm install @capacitor/core @capacitor/ios @capacitor/cli

# Initialise
npx cap init "The Herb Souk" "com.herbsouk.app" --web-dir="."

# Add iOS platform
npx cap add ios

# Sync files
npx cap sync ios
```

### 4d. Configure in Xcode
```bash
# Open in Xcode
npx cap open ios
```

In Xcode:
1. Select your project → Signing & Capabilities
2. Team: Select your Apple Developer account
3. Bundle Identifier: com.herbsouk.app
4. Version: 1.0.0 / Build: 1
5. Deployment Target: iOS 14.0

Add app icons:
- Drag icon files from /icons/ into Assets.xcassets → AppIcon
- Required sizes: 20, 29, 40, 60, 76, 83.5, 1024 (in pt, @1x @2x @3x)

Add launch screen:
- Assets.xcassets → LaunchScreen
- Use apple-splash images

### 4e. Build and archive
1. Xcode menu: Product → Archive
2. In Organiser window: Distribute App → App Store Connect
3. Upload

### 4f. App Store Connect submission
1. Go to: https://appstoreconnect.apple.com
2. My Apps → + → New App
3. Platform: iOS
4. Name: The Herb Souk
5. Bundle ID: com.herbsouk.app
6. SKU: HERBSOUK001
7. Complete all metadata from APP_STORE_LISTING.md
8. Set price: £4.99
9. Submit for review (1–7 days)

---

## STEP 5 — POST-LAUNCH CHECKLIST

### Immediate (Day 1)
- [ ] Test PWA on iPhone: visit site in Safari, tap Share → Add to Home Screen
- [ ] Test PWA on Android: visit site in Chrome, tap menu → Add to Home Screen
- [ ] Test offline mode: turn off WiFi, verify app still works
- [ ] Test all 12 language options
- [ ] Test email and phone CTAs
- [ ] Check all herb photos load correctly

### Marketing (Week 1)
- [ ] Share landing page on social media
- [ ] Announce to your existing patient list
- [ ] Post in TCM practitioner forums (BAcC, RCHM members)
- [ ] Share in natural health Facebook groups
- [ ] Create short video demo for Instagram/TikTok
- [ ] Send to your PlanNet Marketing network

### Revenue tracking
- Apple: App Store Connect → Sales and Trends
- Google: Play Console → Statistics → Revenue
- Target: 200 downloads/month = £1,000/month passive income
- At 1,000 downloads/month = £5,000/month

---

## STEP 6 — PAYMENT PROCESSING

For the PWA version (web direct sales), you can optionally add Stripe:

1. Create Stripe account: https://stripe.com/gb
2. Create a payment link: £4.99 one-off
3. Add to landing page "Buy Now" button
4. On successful payment, reveal a unique access code or redirect to unlocked app URL

For App Store versions, Apple/Google handle all payments and take 30% commission.
**PWA direct sales: you keep 100% minus Stripe fee (~1.5% + 20p)**

---

## REVENUE PROJECTIONS

| Channel | Downloads/mo | Revenue/mo | Your cut |
|---------|-------------|------------|----------|
| Apple App Store | 100 | £499 | £349 (70%) |
| Google Play | 100 | £499 | £349 (70%) |
| PWA Direct (Stripe) | 50 | £249.50 | £241 (97%) |
| **Total** | **250** | **~£1,247** | **~£939/mo** |

Scale to 500/mo downloads = ~£1,900/month passive.
Combine with consultation upsells = significantly more.

---

## SUPPORT & UPDATES

To update the app content:
1. Edit index.html (add herbs, update data)
2. Re-upload to Netlify (web version updates instantly)
3. For app stores: increment version number in manifests and resubmit

---

## NEED HELP?

Charles John · The Herb Souk™
📧 cjnaturalhigh@msn.com
📞 07449 643310

For technical deployment support, consider hiring a developer on:
- Upwork (search: PWA deployment, Capacitor iOS)
- PeoplePerHour
- Fiverr

Budget: £150–400 for a developer to handle the App Store submissions
for you if you prefer not to do it yourself.

---

*The Herb Souk v1.0.0 · Deployment Guide · January 2026*
*Charles John BSc (Hons) Acupuncture · The Herb Souk™*
