# Production Deployment Guide

**Deploy your iOS app to TestFlight and App Store with Vercel backend**

---

## Overview

This guide covers deploying the iOS app to production where:
- **Backend**: Deployed on Vercel
- **Database**: Neon PostgreSQL (same as development)
- **iOS App**: Distributed via TestFlight → App Store

---

## Prerequisites

Before deploying to production:

- [ ] Backend deployed to Vercel and working
- [ ] Vercel URL confirmed: `https://your-domain.vercel.app`
- [ ] Database (Neon) accessible from Vercel
- [ ] Discord OAuth configured with production callback URL
- [ ] Apple Developer account (required for TestFlight/App Store)

---

## Step 1: Configure Production Backend URL

### 1.1 Get Your Vercel URL

Your backend is deployed to Vercel. The URL should look like:
- `https://ticketplatform.vercel.app` (Vercel default)
- `https://your-custom-domain.com` (if using custom domain)

**Find it:**
1. Go to https://vercel.com
2. Open your project
3. Copy the domain URL

### 1.2 Update Configuration.swift

Open `ios-app/TicketPlatform/Utilities/Configuration.swift`

Find this section (around line 39):
```swift
case .production:
    // For production builds (TestFlight, App Store)
    // Replace with your Vercel deployment URL
    return "https://ticketplatform.vercel.app"
```

Replace with YOUR Vercel URL:
```swift
case .production:
    return "https://your-actual-domain.vercel.app"
```

**Save the file** (Cmd+S)

### 1.3 Update Development URL (If Needed)

If your Mac's IP changed, update line 32:
```swift
case .development:
    return "http://192.168.1.100:3000"  // Your Mac's IP
```

---

## Step 2: Verify Vercel Backend Configuration

### 2.1 Check Environment Variables

In Vercel dashboard:
1. Go to your project
2. **Settings → Environment Variables**
3. Verify these are set:
   - `DATABASE_URL` - Neon connection string
   - `NEXTAUTH_URL` - Your Vercel URL (https://your-domain.vercel.app)
   - `NEXTAUTH_SECRET` - Same as local
   - `DISCORD_CLIENT_ID` - Discord app ID
   - `DISCORD_CLIENT_SECRET` - Discord app secret
   - `ENCRYPTION_KEY` - Same as local
   - `BOT_API_KEY` - (Optional) Discord bot key

### 2.2 Test Production API

Test your production API is working:

**Method 1: Browser**
Visit: `https://your-domain.vercel.app/api/health`

**Method 2: Terminal**
```bash
curl https://your-domain.vercel.app/api/health
```

Should return: `{"status":"ok"}` or similar

### 2.3 Discord OAuth Production Callback

Make sure Discord OAuth is configured for production:

1. Go to https://discord.com/developers/applications
2. Select your application
3. Go to **OAuth2 → Redirects**
4. Verify you have:
   - ✅ `https://your-domain.vercel.app/api/auth/callback/discord`

If not, add it and click **Save Changes**.

---

## Step 3: Prepare iOS App for Production

### 3.1 Update App Info

In Xcode:
1. Select project in Navigator (top item)
2. Select **TicketPlatform** target
3. Go to **General** tab

Update:
- **Display Name**: `Ticket Platform` (what users see)
- **Bundle Identifier**: `com.ticketplatform.app` (must be unique)
- **Version**: `1.0.0` (first release)
- **Build**: `1` (increment for each build)

### 3.2 Configure Signing

Still in **General** tab:

1. **Signing & Capabilities** section
2. Check **"Automatically manage signing"**
3. **Team**: Select your Apple Developer team
4. Should show: "Signing Certificate: Apple Development"

### 3.3 Add App Icon (Required)

You need an app icon for App Store submission:

1. Create or generate 1024x1024px PNG icon
2. In Xcode, open **Assets.xcassets**
3. Click **AppIcon**
4. Drag your icon to the 1024x1024 slot
5. Xcode will generate all required sizes

**Quick icon creation:**
- Use Canva, Figma, or similar
- Simple design: Ticket icon with gradient
- Matches your amber theme (#F59E0B)

### 3.4 Update Deployment Info

1. Select project → **TicketPlatform** target
2. Go to **General** tab
3. **Deployment Info**:
   - **Minimum Deployments**: iOS 16.0
   - **Supported Destinations**: iPhone
   - **Orientation**: Portrait (uncheck landscape if not needed)

---

## Step 4: Test Production Build Locally

Before submitting to TestFlight, test the production build:

### 4.1 Change Build Configuration

1. In Xcode: **Product → Scheme → Edit Scheme**
2. Select **Run** on the left
3. **Build Configuration**: Change from "Debug" to "Release"
4. Click **Close**

### 4.2 Run Production Build

Press **Cmd+R** to run

**What happens:**
- App uses Release configuration
- API calls go to your Vercel URL (not localhost)
- This simulates production environment

### 4.3 Test Core Features

Test everything works with production backend:
- [ ] Login with Discord
- [ ] View tickets from database
- [ ] Create new ticket
- [ ] Manage sales
- [ ] View platform accounts
- [ ] Check 2FA codes

### 4.4 Revert to Development

After testing:
1. **Product → Scheme → Edit Scheme**
2. Change back to **"Debug"** configuration
3. Click **Close**

---

## Step 5: Archive for TestFlight

### 5.1 Select Generic iOS Device

At the top of Xcode:
1. Click device selector
2. Choose **"Any iOS Device (arm64)"**

(You can't archive while simulator is selected)

### 5.2 Archive the App

1. **Product → Archive**
2. Wait for build to complete (1-3 minutes)
3. Organizer window opens automatically

### 5.3 Verify Archive

In Organizer:
- Shows your app name
- Version and build number correct
- Size shows (usually 2-5 MB)

---

## Step 6: Upload to App Store Connect

### 6.1 Distribute App

In the Organizer window:
1. Select your archive
2. Click **"Distribute App"** button
3. Choose **"App Store Connect"**
4. Click **Next**

### 6.2 Distribution Options

1. **Destination**: App Store Connect
2. **App Store Connect Distribution Options**:
   - ✅ Upload
   - ✅ Include bitcode for iOS content (if available)
   - ✅ Upload symbols
3. Click **Next**

### 6.3 Signing

1. **Automatically manage signing** (recommended)
2. Click **Next**
3. Review summary
4. Click **Upload**

Wait for upload to complete (1-5 minutes depending on connection).

### 6.4 Confirmation

You'll see: "Upload Successful"
- Click **Done**
- Your build is now processing on App Store Connect

---

## Step 7: Configure TestFlight

### 7.1 Go to App Store Connect

1. Visit https://appstoreconnect.apple.com
2. Sign in with Apple Developer account
3. Click **My Apps**
4. Select **Ticket Platform** (or create new app if first time)

### 7.2 Wait for Processing

Your uploaded build needs to process:
- Usually takes 10-30 minutes
- You'll get email when ready
- Shows under **TestFlight → iOS Builds**

### 7.3 Provide Export Compliance

When build appears:
1. Click on the build
2. **Export Compliance**: Choose "No" (unless using encryption beyond HTTPS)
3. Save

### 7.4 Add Test Information

Required for TestFlight:
1. **What to Test**: Describe what testers should focus on
2. **Test Details**: Any specific instructions

Example:
```
What to Test:
- Login with Discord
- Create and view tickets
- Manage sales per ticket
- View platform accounts with 2FA codes

Test Details:
Make sure you can access all features and data syncs with the web platform.
```

### 7.5 Add Testers

**Internal Testing** (Free, up to 100 testers):
1. Go to **TestFlight → Internal Testing**
2. Click **+** to add testers
3. Enter email addresses
4. They'll receive invitation

**External Testing** (Requires Apple review):
1. Go to **TestFlight → External Testing**
2. Create test group
3. Add testers
4. Submit for review (1-2 days)

---

## Step 8: Beta Testing

### 8.1 Testers Install App

Testers receive email:
1. Click invitation link
2. Install TestFlight app (if not installed)
3. Accept invitation
4. Install your app

### 8.2 Monitor Feedback

In App Store Connect:
- View tester metrics
- Read crash reports
- Collect feedback

### 8.3 Update Builds

If you need to fix bugs:
1. Fix code in Xcode
2. Increment **Build number** (1 → 2 → 3...)
3. Archive again
4. Upload new build
5. Testers auto-update

---

## Step 9: App Store Submission (Optional)

When ready for public release:

### 9.1 Prepare App Store Listing

In App Store Connect → **App Information**:

**Required:**
- App Name: "Ticket Platform"
- Subtitle: "Professional ticket reselling"
- Description: (Write compelling description)
- Keywords: ticket, reselling, platform, events
- Support URL: Your support site
- Privacy Policy URL: Your privacy policy

### 9.2 Screenshots

Required sizes (use iPhone 15 Pro Max simulator):
1. Run app in simulator
2. Navigate to key screens
3. Take screenshots (Cmd+S in simulator)
4. Upload to App Store Connect

Minimum 3 screenshots, recommended:
- Dashboard view
- Ticket details
- Sales manager
- Platform accounts

### 9.3 App Review Information

Provide:
- Demo account (if login required)
- Review notes
- Contact information

### 9.4 Submit for Review

1. Select your build
2. Click **"Add for Review"**
3. Submit

Review typically takes:
- First submission: 2-5 days
- Updates: 1-2 days

---

## Production Checklist

Before going live:

### Backend (Vercel)
- [ ] Production URL working
- [ ] All environment variables set
- [ ] Database connection working
- [ ] Discord OAuth configured
- [ ] HTTPS enforced
- [ ] CORS configured if needed

### iOS App
- [ ] Production URL in Configuration.swift
- [ ] App icon added
- [ ] Bundle identifier unique
- [ ] Version numbers set
- [ ] Tested with production API
- [ ] No debug code or logs
- [ ] Privacy policy ready

### App Store
- [ ] Apple Developer account active
- [ ] App created in App Store Connect
- [ ] Screenshots prepared
- [ ] Description written
- [ ] Support URL ready
- [ ] Privacy policy URL ready

---

## Environment Summary

### Development
```
iOS App (Debug)
  ↓
http://192.168.1.100:3000 (Local Mac)
  ↓
PostgreSQL (Neon)
```

### Production
```
iOS App (Release)
  ↓
https://your-domain.vercel.app (Vercel)
  ↓
PostgreSQL (Neon - Same database!)
```

**Important**: Both environments use the **same database**. Data is shared!

---

## Automatic Environment Switching

The app automatically knows which environment to use:

**Debug Build** (Cmd+R in Xcode):
- Uses Development configuration
- Connects to local Mac

**Release Build** (Archive):
- Uses Production configuration
- Connects to Vercel

**Manual Override** (Optional):
- Set `API_BASE_URL` environment variable in Xcode scheme
- Overrides both configurations

---

## Updating Production App

When you need to update:

1. **Make changes** in Xcode
2. **Increment build number**:
   - Project → Target → General
   - Build: 1 → 2 → 3...
3. **Test locally** with production API
4. **Archive** (Product → Archive)
5. **Upload** to App Store Connect
6. **Release** via TestFlight or App Store

**Note**: Version stays same for minor updates. Only change for major releases.

---

## Troubleshooting Production Issues

### "Cannot connect to server" in production build

1. Check Vercel URL is correct in Configuration.swift
2. Verify backend is deployed and running
3. Test API in browser: https://your-domain.vercel.app/api/health

### "Unauthorized" errors

1. Check Discord OAuth callback URL includes production domain
2. Verify NEXTAUTH_URL environment variable in Vercel
3. Clear app and try login again

### Data not syncing

1. Ensure both dev and prod use same Neon database
2. Check DATABASE_URL in Vercel matches local
3. Verify user is logging in with same Discord account

### Build rejected by App Store

Common reasons:
- Missing privacy policy
- No demo account for review
- Crashes on startup
- Missing required device permissions

---

## Monitoring Production

### Vercel Dashboard
- View function logs
- Monitor API performance
- Check error rates

### App Store Connect
- Crash reports
- User metrics
- Reviews and ratings

### Neon Dashboard
- Database performance
- Query analytics
- Connection stats

---

## Cost Considerations

### Free Tier Limits

**Vercel Free:**
- 100GB bandwidth/month
- Serverless function execution
- Custom domains

**Neon Free:**
- 3 GB storage
- Unlimited compute time
- Active connections

**Apple Developer:**
- $99/year (required for App Store)
- Includes TestFlight

**Upgrade when:**
- Traffic exceeds free limits
- Need more database storage
- Require priority support

---

## Next Steps

After production deployment:

1. **Monitor** - Watch for crashes and errors
2. **Iterate** - Release updates based on feedback
3. **Market** - Promote your app
4. **Support** - Respond to user reviews
5. **Grow** - Add new features from FEATURES.md

---

**Your app is now live! 🎉**

Users can download from the App Store and it connects to your Vercel backend using your Neon database.

---

**Last Updated:** January 2025
