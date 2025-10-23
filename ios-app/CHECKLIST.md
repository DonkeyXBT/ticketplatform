# iOS App Setup Checklist

Print this out or keep it open while setting up!

---

## Before You Start

- [ ] Mac with macOS
- [ ] Xcode 15.0+ installed
- [ ] Backend project accessible
- [ ] Know your Mac's IP address: `___________________`

---

## Step 1: Prepare Backend

- [ ] Open Terminal
- [ ] Navigate to ticketplatform directory
- [ ] Run `npm run dev`
- [ ] Backend shows: "started server on 0.0.0.0:3000"

---

## Step 2: Find Mac IP Address

Run in Terminal:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

- [ ] IP address found
- [ ] Written down: `___________________`

---

## Step 3: Create Xcode Project

- [ ] Open Xcode
- [ ] File → New → Project
- [ ] Choose iOS → App
- [ ] Product Name: `TicketPlatform`
- [ ] Interface: SwiftUI
- [ ] Language: Swift
- [ ] Save to: `ios-app/` folder
- [ ] Uncheck "Create Git repository"

---

## Step 4: Add Swift Files

### Create Groups (Folders):
- [ ] App
- [ ] Views
- [ ] Components
- [ ] Models
- [ ] Services
- [ ] Themes

### Add Files to Each Group:

**App/**
- [ ] TicketPlatformApp.swift

**Views/**
- [ ] LoginView.swift
- [ ] MainTabView.swift
- [ ] DashboardView.swift
- [ ] AccountsView.swift
- [ ] SalesManagerView.swift
- [ ] AddTicketView.swift
- [ ] EventsView.swift
- [ ] ProfileView.swift

**Components/**
- [ ] TicketCardView.swift
- [ ] CommonComponents.swift

**Models/**
- [ ] Models.swift

**Services/**
- [ ] APIService.swift
- [ ] AuthenticationManager.swift

**Themes/**
- [ ] ThemeManager.swift

---

## Step 5: Configure API Connection

- [ ] Open `Services/APIService.swift`
- [ ] Find line with `self.baseURL = ...`
- [ ] Change to: `"http://YOUR_IP_HERE:3000"`
- [ ] Replace YOUR_IP_HERE with actual IP
- [ ] Save file (Cmd+S)

---

## Step 6: Build

- [ ] Product → Clean Build Folder (Cmd+Shift+K)
- [ ] Product → Build (Cmd+B)
- [ ] Build succeeds with no errors

---

## Step 7: Run

- [ ] Select iPhone simulator (any model)
- [ ] Press Cmd+R or click Play button
- [ ] Simulator launches
- [ ] App opens to login screen

---

## Step 8: Test

- [ ] Login with Discord account
- [ ] Dashboard loads with tickets
- [ ] Navigate to Accounts tab
- [ ] Navigate to Events tab
- [ ] Try creating a new ticket
- [ ] Ticket appears in both iOS and web app

---

## Common Issues

### Cannot connect to server
- [ ] Backend is running?
- [ ] IP address correct?
- [ ] Same Wi-Fi network?

### Build fails
- [ ] Clean build folder
- [ ] Check all files copied
- [ ] Restart Xcode

### No data showing
- [ ] Logged in with same Discord account as web?
- [ ] Backend has data?

---

## Production Checklist

- [ ] Change API URL to production domain
- [ ] Update bundle identifier
- [ ] Add app icon
- [ ] Archive app
- [ ] Upload to TestFlight
- [ ] Test beta version

---

**Stuck?** See SETUP_GUIDE.md for detailed help!
