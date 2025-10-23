# iOS App - Quick Start

**Get the iOS app running in 5 minutes**

---

## The Simple Version

The iOS app talks to your **existing backend**. No new database, no new server.

```
┌─────────────────┐
│   iOS App       │
│   (SwiftUI)     │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│  Next.js API    │ ← Same API as web app
│  (localhost)    │
└────────┬────────┘
         │ Prisma
         ↓
┌─────────────────┐
│  PostgreSQL     │ ← Same database
│  (Neon)         │
└─────────────────┘
```

---

## Prerequisites Checklist

- [ ] Mac with Xcode 15+ installed
- [ ] Backend running: `npm run dev` in terminal
- [ ] Know your Mac's IP address

---

## Step 1: Find Your Mac's IP (30 seconds)

Open Terminal and run:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

You'll see something like: `192.168.1.100`

**Write this down!** ✍️ My IP is: `_________________`

---

## Step 2: Create Xcode Project (2 minutes)

1. Open **Xcode**
2. **File → New → Project**
3. Choose **iOS → App**
4. Fill in:
   - Product Name: `TicketPlatform`
   - Interface: **SwiftUI**
   - Language: **Swift**
5. Save to: `/Users/davey/Documents/claude/ticketplatform/ios-app/`

---

## Step 3: Add All Swift Files (2 minutes)

### Quick Method (Using Finder)

1. In **Finder**, open:
   `/Users/davey/Documents/claude/ticketplatform/ios-app/TicketPlatform/`

2. Select ALL folders:
   - App/
   - Views/
   - Components/
   - Models/
   - Services/
   - Themes/

3. **Drag them into Xcode** onto the `TicketPlatform` folder in the left sidebar

4. In the dialog:
   - ✅ Check "Copy items if needed"
   - ✅ Check "Create groups"
   - ✅ Check the TicketPlatform target

5. Click **Finish**

Done! All files are added.

---

## Step 4: Update API URL (30 seconds)

1. In Xcode, open: `Services/APIService.swift`

2. Find line 23 (around there):
```swift
self.baseURL = ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http://localhost:3000"
```

3. Change to YOUR Mac's IP:
```swift
self.baseURL = ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http://192.168.1.100:3000"
```
*(Replace `192.168.1.100` with the IP you wrote down!)*

4. Save: **Cmd+S**

---

## Step 5: Run! (30 seconds)

1. Make sure backend is running:
```bash
cd /Users/davey/Documents/claude/ticketplatform
npm run dev
```

2. In Xcode:
   - Select any iPhone simulator (iPhone 15 Pro is fine)
   - Press **Cmd+R** (or click Play ▶️ button)

3. Wait for build...

4. Simulator opens with login screen! 🎉

---

## Test It Works

1. **Login** with your Discord credentials
2. You should see your **tickets from the database**
3. Try creating a new ticket
4. It appears in both the iOS app AND the web app!

---

## Troubleshooting

### "Cannot connect to server"

❌ Backend not running
```bash
cd ticketplatform
npm run dev
```

❌ Wrong IP address
- Check IP again: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Update in APIService.swift

### "Build failed"

```bash
# Clean and rebuild
# In Xcode: Product → Clean Build Folder (Cmd+Shift+K)
# Then: Product → Build (Cmd+B)
```

### "No data showing"

Make sure you're logged in with the **same Discord account** as the web app!

---

## That's It!

You now have:
- ✅ iOS app running
- ✅ Connected to your backend
- ✅ Using your database
- ✅ Same data as web app

---

## What Just Happened?

```
You created ticket on iOS
    ↓
iOS app sends POST to http://192.168.1.100:3000/api/tickets
    ↓
Your Next.js backend receives it
    ↓
Prisma saves to PostgreSQL database
    ↓
Both web app AND iOS app can see it!
```

---

## Next Steps

- **Read full guide**: `SETUP_GUIDE.md` for detailed explanations
- **Test all features**: Sales, accounts, events
- **Deploy**: When ready, change API URL to production

---

**Having issues?** Check `SETUP_GUIDE.md` for detailed troubleshooting.
