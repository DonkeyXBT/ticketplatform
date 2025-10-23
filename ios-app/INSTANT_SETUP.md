# ⚡ INSTANT SETUP - Get Running in 3 Minutes

**The absolute fastest way to test your iOS app**

---

## Why iOS Can't Connect Directly to Database

**Important:** iOS apps cannot connect directly to PostgreSQL (Neon) because:
1. ❌ Security risk - database credentials would be in the app
2. ❌ Technical limitation - iOS doesn't support PostgreSQL natively
3. ❌ Bad practice - violates security best practices

**The Right Way:**
```
iOS App → Your Backend API (localhost:3000) → Neon Database
```

Your backend already handles database connections. The iOS app just makes HTTP requests!

---

## ⚡ 3-Minute Setup

### Step 1: Start Your Backend (30 seconds)

Open Terminal:
```bash
cd /Users/davey/Documents/claude/ticketplatform
npm run dev
```

Wait until you see:
```
✓ Ready on http://localhost:3000
```

**Leave this terminal running!**

---

### Step 2: Create Xcode Project (1 minute)

1. Open **Xcode**
2. **File → New → Project**
3. Choose **iOS → App**
4. Settings:
   - Product Name: `TicketPlatform`
   - Interface: **SwiftUI**
   - Language: **Swift**
5. Save to: `/Users/davey/Documents/claude/ticketplatform/ios-app/`
6. **Uncheck** "Create Git repository"
7. Click **Create**

---

### Step 3: Add All Files (1 minute)

**The Fast Way:**

1. In **Finder**, navigate to:
   `/Users/davey/Documents/claude/ticketplatform/ios-app/TicketPlatform/`

2. **Select ALL** these folders:
   - App/
   - Views/
   - Components/
   - Models/
   - Services/
   - Themes/
   - Utilities/

3. **Drag them** into Xcode's left sidebar onto the `TicketPlatform` folder

4. In the dialog:
   - ✅ "Copy items if needed"
   - ✅ "Create groups"
   - ✅ TicketPlatform target
   - Click **Finish**

---

### Step 4: RUN! (30 seconds)

1. Select **iPhone 15 Pro** simulator at top
2. Press **Cmd+R** (or click Play ▶️)
3. Wait for build...
4. App opens! 🎉

---

## ✅ That's It!

The app is now connected to:
- **Backend**: localhost:3000 (your `npm run dev`)
- **Database**: Neon PostgreSQL (via your backend)
- **Authentication**: Discord OAuth

**Try it:**
1. Login with Discord
2. You should see your tickets from the database!
3. Everything works exactly like the web app

---

## How Data Flows

```
┌─────────────────────────┐
│     iOS App             │
│  (SwiftUI in Xcode)     │
└──────────┬──────────────┘
           │
           │ HTTP Request
           │ POST /api/tickets
           ↓
┌─────────────────────────┐
│  Next.js Backend        │
│  (npm run dev)          │
│  localhost:3000         │
└──────────┬──────────────┘
           │
           │ Prisma Query
           │ prisma.ticket.create()
           ↓
┌─────────────────────────┐
│  Neon PostgreSQL        │
│  (Cloud Database)       │
└─────────────────────────┘
```

**The iOS app doesn't connect to the database directly!**
- It sends HTTP requests to your backend
- Your backend talks to the database
- This is secure, standard, and how all mobile apps work

---

## No Configuration Needed!

The app is **pre-configured** to use `localhost:3000`:
- No IP address to find
- No URLs to change
- Just run `npm run dev` and it works!

See `Configuration.swift` - it's set to localhost by default.

---

## Troubleshooting

### "Cannot connect to server"

Make sure backend is running:
```bash
# Check if it's running
lsof -i :3000

# If not, start it:
cd ticketplatform
npm run dev
```

### "Build failed" in Xcode

1. **Product → Clean Build Folder** (Cmd+Shift+K)
2. **Product → Build** (Cmd+B)
3. If still fails, check all files are added

### "No data showing"

Make sure you're logged in with the **same Discord account** as the web app!

---

## What About Vercel/Production?

For testing locally, you don't need Vercel!

**Local Development:**
- iOS App → localhost:3000 → Neon Database ✅

**Production (later):**
- iOS App → Vercel URL → Neon Database ✅

The database is the same in both cases - only the API URL changes.

---

## Quick Commands Reference

### Start Backend
```bash
cd /Users/davey/Documents/claude/ticketplatform
npm run dev
```

### Build iOS App
In Xcode: **Cmd+B**

### Run iOS App
In Xcode: **Cmd+R**

### Clean Build
In Xcode: **Cmd+Shift+K**

---

## Next Steps

Once it's running:

1. **Test features**:
   - Login
   - View tickets
   - Create ticket
   - Manage sales
   - View accounts

2. **Make changes**:
   - Edit Swift files
   - Press Cmd+R to see changes

3. **Deploy to production**:
   - See `PRODUCTION_DEPLOYMENT.md`
   - Update Configuration.swift with Vercel URL

---

**That's literally it!** No complex setup, no IP addresses, just:
1. Run backend: `npm run dev`
2. Run iOS app: `Cmd+R` in Xcode
3. It works!

The iOS app uses your **existing backend** which uses your **existing database**. Nothing new to set up.

---

**Last Updated:** January 2025
