# iOS App Setup Guide

**Complete step-by-step instructions to get the iOS app running with your existing backend**

The iOS app connects to your **existing Next.js backend** and uses your **existing PostgreSQL database**. No separate backend needed!

---

## Overview

```
iOS App (SwiftUI)
    ↓ HTTP/HTTPS requests
Next.js API (localhost:3000)
    ↓ Prisma queries
PostgreSQL Database (Neon)
```

The iOS app is just another client that talks to the same API as your web app.

---

## Prerequisites

Before starting, make sure you have:

- ✅ **Mac with macOS** (required for Xcode)
- ✅ **Xcode 15.0+** installed from Mac App Store
- ✅ **Backend running** (your Next.js app)
- ✅ **Database connected** (Neon PostgreSQL)

---

## Step 1: Create Xcode Project

### 1.1 Open Xcode

1. Open **Xcode** from Applications or Spotlight
2. You'll see the welcome screen

### 1.2 Create New Project

1. Click **"Create new project"** or **File → New → Project**
2. In the template selector:
   - Choose **iOS** tab at top
   - Select **App** template
   - Click **Next**

### 1.3 Configure Project Settings

Fill in the project details:

| Field | Value |
|-------|-------|
| **Product Name** | `TicketPlatform` |
| **Team** | Select your Apple ID (or leave as None) |
| **Organization Identifier** | `com.ticketplatform` |
| **Bundle Identifier** | Will auto-fill as `com.ticketplatform.TicketPlatform` |
| **Interface** | **SwiftUI** |
| **Language** | **Swift** |
| **Storage** | None (uncheck CoreData) |
| **Include Tests** | Uncheck both boxes |

Click **Next**

### 1.4 Save Project

1. Navigate to: `/Users/davey/Documents/claude/ticketplatform/ios-app/`
2. Name the project: `TicketPlatform`
3. **IMPORTANT**: Uncheck "Create Git repository" (we already have one)
4. Click **Create**

Xcode will create the project and open it.

---

## Step 2: Add Swift Files to Project

You'll see Xcode created a basic project with just a few files. We need to add all our Swift files.

### 2.1 Delete Default Files

In the Project Navigator (left sidebar):
1. Right-click `ContentView.swift` → **Delete** → Move to Trash
2. The `TicketPlatformApp.swift` file can stay (we'll replace its contents)

### 2.2 Create Folder Structure

In Project Navigator:
1. Right-click on `TicketPlatform` folder (the one with the app icon)
2. Select **New Group**
3. Create these groups (folders):
   - `App`
   - `Views`
   - `Components`
   - `Models`
   - `Services`
   - `Themes`

Your structure should look like:
```
TicketPlatform
├── App/
├── Views/
├── Components/
├── Models/
├── Services/
├── Themes/
└── Assets.xcassets
```

### 2.3 Add Swift Files

Now we'll add each Swift file to the correct folder:

#### App Folder
1. Right-click `App` folder → **New File**
2. Choose **Swift File** → **Next**
3. Name: `TicketPlatformApp` (replace existing)
4. **Save**
5. Copy the content from `/ios-app/TicketPlatform/App/TicketPlatformApp.swift`

#### Views Folder
Right-click `Views` → **New File** → **Swift File** for each:
- `LoginView.swift`
- `MainTabView.swift`
- `DashboardView.swift`
- `AccountsView.swift`
- `SalesManagerView.swift`
- `AddTicketView.swift`
- `EventsView.swift`
- `ProfileView.swift`

Copy the contents from corresponding files in `/ios-app/TicketPlatform/Views/`

#### Components Folder
Right-click `Components` → **New File** → **Swift File** for each:
- `TicketCardView.swift`
- `CommonComponents.swift`

#### Models Folder
Right-click `Models` → **New File** → **Swift File**:
- `Models.swift`

#### Services Folder
Right-click `Services` → **New File** → **Swift File** for each:
- `APIService.swift`
- `AuthenticationManager.swift`

#### Themes Folder
Right-click `Themes` → **New File** → **Swift File**:
- `ThemeManager.swift`

### 2.4 Verify All Files Added

Your Project Navigator should now show:
```
TicketPlatform
├── App/
│   └── TicketPlatformApp.swift
├── Views/
│   ├── LoginView.swift
│   ├── MainTabView.swift
│   ├── DashboardView.swift
│   ├── AccountsView.swift
│   ├── SalesManagerView.swift
│   ├── AddTicketView.swift
│   ├── EventsView.swift
│   └── ProfileView.swift
├── Components/
│   ├── TicketCardView.swift
│   └── CommonComponents.swift
├── Models/
│   └── Models.swift
├── Services/
│   ├── APIService.swift
│   └── AuthenticationManager.swift
└── Themes/
    └── ThemeManager.swift
```

---

## Step 3: Configure API Connection

The iOS app needs to know where your backend API is running.

### 3.1 For Development (Local Testing)

When running locally, the backend is at `http://localhost:3000`, but there's a catch:

**Important**: iOS Simulator can't access `localhost` from the Mac. You need to use your Mac's IP address.

#### Find Your Mac's IP Address

**Option 1: System Preferences**
1. Open **System Preferences** → **Network**
2. Select **Wi-Fi** (or Ethernet if wired)
3. Your IP will show as something like: `192.168.1.100`

**Option 2: Terminal**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Copy the IP address (looks like `192.168.1.x` or `10.0.0.x`)

#### Update Backend to Accept Connections

In your Next.js backend, make sure it accepts connections from all interfaces:

```bash
# From ticketplatform directory
npm run dev
```

The dev server should show:
```
- Local:   http://localhost:3000
- Network: http://192.168.1.100:3000
```

#### Configure iOS App

Open `Services/APIService.swift` and find this line:

```swift
self.baseURL = ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http://localhost:3000"
```

Change the default to your Mac's IP:

```swift
self.baseURL = ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http://192.168.1.100:3000"
```

**Replace `192.168.1.100` with YOUR Mac's actual IP address!**

### 3.2 For Production

When deploying to production:

1. In Xcode: **Product → Scheme → Edit Scheme**
2. Select **Run** on the left
3. Go to **Arguments** tab
4. Under **Environment Variables**, click **+**
5. Add:
   - **Name**: `API_BASE_URL`
   - **Value**: `https://your-domain.vercel.app`

---

## Step 4: Build and Run

### 4.1 Select Simulator

At the top of Xcode window:
1. Click the device selector (shows "iPhone 15 Pro" or similar)
2. Choose any iPhone simulator (iPhone 14 or newer recommended)

### 4.2 Build the Project

Press **Cmd+B** to build

**If you see errors**:
- Make sure all files are copied correctly
- Check that imports are correct
- Clean build folder: **Product → Clean Build Folder** (Cmd+Shift+K)

### 4.3 Run the App

Press **Cmd+R** or click the **Play** button

The iOS Simulator will launch and your app should open!

---

## Step 5: Test the Connection

### 5.1 Start Your Backend

Make sure your Next.js backend is running:

```bash
cd /Users/davey/Documents/claude/ticketplatform
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000
```

### 5.2 Test Login

In the iOS Simulator:
1. The app should open to the Login screen
2. Enter your email and password
3. Tap **Sign In**

**What happens**:
```
iOS App → POST http://192.168.1.100:3000/api/auth/signin
    ↓
Next.js API → Validates credentials
    ↓
PostgreSQL Database → Returns user data
    ↓
iOS App → Saves token to Keychain → Shows Dashboard
```

### 5.3 Test Data Loading

After login:
1. You should see the **Dashboard** with your tickets
2. Navigate to **Accounts** tab to see platform accounts
3. Navigate to **Events** tab to see upcoming events

**The data comes from your existing database!** No new database needed.

---

## How Data Flow Works

### Reading Data (GET)

```
User taps "Dashboard"
    ↓
iOS App: viewModel.loadTickets()
    ↓
APIService: GET http://192.168.1.100:3000/api/tickets
    ↓
Next.js API: /api/tickets/route.ts
    ↓
Prisma: prisma.ticket.findMany()
    ↓
PostgreSQL Database (Neon)
    ↓
Returns JSON data
    ↓
iOS App: Updates UI with tickets
```

### Creating Data (POST)

```
User fills "Add Ticket" form and taps "Save"
    ↓
iOS App: APIService.createTicket(request)
    ↓
APIService: POST http://192.168.1.100:3000/api/tickets
    ↓
Next.js API: /api/tickets/route.ts
    ↓
Prisma: prisma.ticket.create()
    ↓
PostgreSQL Database (Neon) - inserts new row
    ↓
Returns created ticket JSON
    ↓
iOS App: Refreshes list, shows new ticket
```

### Multi-Buyer Sales

```
User manages sales for a ticket
    ↓
iOS App: Shows SalesManagerView
    ↓
Fetches: GET /api/tickets/[id]/sales
    ↓
Creates: POST /api/tickets/[id]/sales
    ↓
Toggles sent: POST /api/sales/[id]/toggle-sent
    ↓
All use same database Sale table
```

---

## Troubleshooting

### Problem: "Cannot connect to server"

**Solution**:
1. Check backend is running (`npm run dev`)
2. Verify IP address in APIService.swift matches your Mac's IP
3. Make sure Mac and Simulator are on same network
4. Try pinging from Terminal: `ping 192.168.1.100`

### Problem: "Build failed" with errors

**Solution**:
1. **Product → Clean Build Folder** (Cmd+Shift+K)
2. Close Xcode completely
3. Delete `DerivedData` folder:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
4. Reopen Xcode and rebuild

### Problem: "Unauthorized" error

**Solution**:
1. Token might be invalid
2. In Simulator: **Device → Erase All Content and Settings**
3. Rebuild and login again

### Problem: Can't see data from web app

**Solution**:
1. Verify you're logged in with the same Discord account
2. Check user ID matches in database
3. Data is user-specific - each user only sees their own tickets

### Problem: Simulator is slow

**Solution**:
1. Close other apps on your Mac
2. Use a smaller device (iPhone SE instead of iPhone 15 Pro Max)
3. Disable Metal API Validation:
   - **Product → Scheme → Edit Scheme**
   - **Run → Options**
   - Uncheck "Metal API Validation"

---

## Testing on Real iPhone

### 5.1 Connect iPhone

1. Connect iPhone to Mac with cable
2. Trust computer on iPhone
3. In Xcode, select your iPhone from device list

### 5.2 Configure Signing

1. Select project in navigator (top item)
2. Select **TicketPlatform** target
3. Go to **Signing & Capabilities** tab
4. Check **Automatically manage signing**
5. Select your Apple ID team

### 5.3 Update API URL

Since iPhone is on Wi-Fi (not connected to Mac's localhost):
- Keep using your Mac's IP: `http://192.168.1.100:3000`
- Make sure iPhone is on **same Wi-Fi network** as Mac

### 5.4 Run on Device

Press **Cmd+R**

iPhone will show: "Untrusted Developer"
1. Open **Settings** on iPhone
2. Go to **General → VPN & Device Management**
3. Trust your developer profile
4. Return to app and launch

---

## Production Deployment

### Option 1: TestFlight (Beta Testing)

1. **Archive the app**:
   - **Product → Archive**
   - Wait for build to complete

2. **Upload to App Store Connect**:
   - Window will open showing archive
   - Click **Distribute App**
   - Choose **App Store Connect**
   - Follow prompts to upload

3. **Set production API URL**:
   - Before archiving, change APIService.swift:
   ```swift
   self.baseURL = ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "https://your-domain.vercel.app"
   ```

4. **Submit for TestFlight review**:
   - Go to App Store Connect
   - Submit for Beta review
   - Share with testers

### Option 2: App Store Release

Follow Apple's App Store submission process:
1. Complete app metadata
2. Add screenshots (required)
3. Set pricing
4. Submit for review

---

## Environment Variables Summary

| Environment | API_BASE_URL | Where to Set |
|------------|--------------|--------------|
| **Local (Simulator)** | `http://192.168.1.100:3000` | Hardcoded in APIService.swift |
| **Local (Device)** | `http://192.168.1.100:3000` | Hardcoded in APIService.swift |
| **Production** | `https://your-domain.vercel.app` | Hardcoded or Environment Variable |

---

## Quick Reference Commands

### Start Backend
```bash
cd /Users/davey/Documents/claude/ticketplatform
npm run dev
```

### Find Mac IP
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Clean Xcode
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Build & Run
- **Build**: Cmd+B
- **Run**: Cmd+R
- **Clean**: Cmd+Shift+K

---

## Database Access

The iOS app uses **your existing database**:

- **Connection**: iOS App → Next.js API → Prisma → PostgreSQL (Neon)
- **Tables Used**: User, Ticket, Sale, PlatformAccount
- **Authentication**: Discord OAuth (same as web app)
- **Data Isolation**: Each user sees only their data

**No database setup needed!** The iOS app doesn't connect directly to the database - it goes through your Next.js API, just like the web app does.

---

## Summary

✅ **What you need**:
1. Xcode project with Swift files
2. Backend running (`npm run dev`)
3. Mac's IP address in APIService.swift

✅ **Data flow**:
- iOS App → HTTP requests → Next.js API → Prisma → PostgreSQL
- Same database, same API, different client

✅ **Authentication**:
- Login on iOS → Token stored in Keychain
- All requests include bearer token
- Same user accounts as web app

✅ **Testing**:
- Simulator: Use Mac's IP address
- Real device: Use Mac's IP on same Wi-Fi
- Production: Use Vercel URL

---

## Next Steps

Once the app is running:

1. **Test all features**:
   - Login/logout
   - View tickets
   - Create new ticket
   - Manage sales
   - View platform accounts
   - Check 2FA codes

2. **Customize**:
   - Update bundle identifier
   - Add app icon
   - Customize colors if needed

3. **Deploy**:
   - TestFlight for beta testing
   - App Store for public release

---

**Need help?** Check the troubleshooting section or create an issue on GitHub.

**Last Updated:** January 2025
