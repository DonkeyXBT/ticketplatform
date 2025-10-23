# Ticket Platform - iOS App

**Professional ticket reselling management for iOS**

Native iOS application built with SwiftUI, providing the full functionality of the web platform in a beautiful, native mobile experience.

---

## Features

### Complete Feature Parity
- **Dashboard** - View all tickets with statistics
- **Multi-Buyer Sales** - Manage multiple sales per ticket
- **Platform Accounts** - Securely store credentials with 2FA codes
- **Events Calendar** - Upcoming events at a glance
- **Profile & Settings** - Customize your experience

### iOS-Specific Features
- **Native SwiftUI Design** - Smooth, responsive interface
- **Dark Mode** - Beautiful dark theme matching web app
- **Secure Storage** - Keychain integration for tokens
- **Live 2FA Codes** - Built-in authenticator with countdown
- **Pull to Refresh** - Intuitive data updates
- **Haptic Feedback** - Tactile confirmations

---

## Screenshots

The app matches the web platform's design with:
- Amber gradient theme
- Dark mode by default
- Clean, modern card-based UI
- Smooth animations and transitions

---

## 🚀 Quick Start

**Want to get started fast?**

### Development Setup
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup (local testing)
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete walkthrough with explanations

### Production Deployment
- **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Deploy to TestFlight & App Store with Vercel backend

---

## Requirements

- **iOS 16.0+**
- **Xcode 15.0+**
- **Swift 5.9+**
- **Backend API running** (from main project)

---

## How It Works

The iOS app is a **client** that connects to your **existing backend**:

```
┌──────────────────────────────────────────────────┐
│              iOS App (SwiftUI)                   │
│  • Dashboard  • Accounts  • Sales  • Events      │
└───────────────────────┬──────────────────────────┘
                        │
                    HTTP/HTTPS Requests
                        │
┌───────────────────────▼──────────────────────────┐
│         Next.js Backend (localhost:3000)         │
│    Same API as web app - all endpoints work     │
└───────────────────────┬──────────────────────────┘
                        │
                   Prisma ORM
                        │
┌───────────────────────▼──────────────────────────┐
│      PostgreSQL Database (Neon)                  │
│   Same database - all data shared with web app  │
└──────────────────────────────────────────────────┘
```

**Key Points:**
- ✅ Uses your **existing Next.js backend** - no new server needed
- ✅ Uses your **existing PostgreSQL database** - no new database needed
- ✅ Uses your **existing API endpoints** - no new APIs needed
- ✅ Same authentication (Discord OAuth)
- ✅ Same data for web app and iOS app

---

## Project Structure

```
ios-app/TicketPlatform/
├── App/
│   └── TicketPlatformApp.swift    # Main app entry point
├── Views/
│   ├── LoginView.swift            # Discord OAuth login
│   ├── MainTabView.swift          # Tab navigation
│   ├── DashboardView.swift        # Ticket management
│   ├── AccountsView.swift         # Platform accounts with 2FA
│   ├── SalesManagerView.swift    # Multi-buyer sales
│   ├── AddTicketView.swift        # Create tickets
│   ├── EventsView.swift           # Calendar view
│   └── ProfileView.swift          # Settings & profile
├── Components/
│   ├── TicketCardView.swift       # Ticket display components
│   └── CommonComponents.swift     # Reusable UI components
├── Models/
│   └── Models.swift               # Data models
├── Services/
│   ├── APIService.swift           # API communication
│   └── AuthenticationManager.swift # Auth & keychain
├── Themes/
│   └── ThemeManager.swift         # Design system & colors
└── Utilities/
    └── (Helper utilities)
```

---

## 📖 Setup Guides

We have two setup guides to help you get started:

### 🏃‍♂️ [QUICK_START.md](./QUICK_START.md)
**5-minute setup** - Get the app running fast with minimal explanation.

Perfect if you:
- Know Xcode basics
- Just want to see it working
- Can troubleshoot yourself

### 📚 [SETUP_GUIDE.md](./SETUP_GUIDE.md)
**Complete walkthrough** - Step-by-step with detailed explanations.

Perfect if you:
- New to iOS development
- Want to understand how it works
- Need troubleshooting help

**Both guides cover:**
- Creating Xcode project
- Adding Swift files
- Connecting to your backend
- Testing the app
- Deploying to production

---

## Architecture

### MVVM Pattern
- **Views** - SwiftUI views with minimal logic
- **ViewModels** - Business logic and state management
- **Models** - Data structures matching API
- **Services** - API calls and authentication

### State Management
- `@StateObject` for view models
- `@EnvironmentObject` for shared managers
- `@Published` for reactive properties

### Authentication Flow
1. User logs in via LoginView
2. Token saved to Keychain
3. AuthenticationManager updates published state
4. App switches to MainTabView
5. All API calls include token from Keychain

### API Communication
- Async/await for all network calls
- Generic request method in APIService
- Automatic token injection
- ISO8601 date decoding
- Proper error handling

---

## Design System

All design tokens match the web app:

### Colors
```swift
// Amber theme
.primaryAmber       // #F59E0B
.amberLight         // #FEF3C7
.amberDark          // #92400E

// Backgrounds
.backgroundPrimary   // #0F172A
.backgroundSecondary // #1E293B
.backgroundTertiary  // #334155

// Status colors
.statusListed       // Blue
.statusPending      // Amber
.statusSold         // Green
```

### Typography
```swift
.displayLarge     // 32pt Bold
.displayMedium    // 24pt Bold
.headingLarge     // 18pt Semibold
.bodyMedium       // 14pt Regular
.labelSmall       // 12pt Medium
```

### Spacing
```swift
Spacing.xs   // 4pt
Spacing.sm   // 8pt
Spacing.md   // 16pt
Spacing.lg   // 24pt
Spacing.xl   // 32pt
Spacing.xxl  // 48pt
```

### Corner Radius
```swift
CornerRadius.sm   // 8pt
CornerRadius.md   // 12pt
CornerRadius.lg   // 16pt
CornerRadius.xl   // 20pt
CornerRadius.full // 999pt
```

---

## Key Components

### TicketCardView
Displays ticket information in card format with three view modes:
- **List** - Compact row view
- **Card** - Medium card with key details
- **Detailed** - Full card with all information

### TOTPCodeView
Live 2FA code generator with:
- Formatted code display (123 456)
- 30-second countdown timer
- Visual indicator when expiring
- Copy to clipboard

### SalesManager
Complete sales management:
- View all sales for a ticket
- Add new sales with validation
- Toggle tickets sent/not sent
- Buyer information display

### StatisticsView
Dashboard statistics cards:
- Total tickets count
- Total revenue
- Total profit
- Color-coded indicators

---

## API Integration

### Endpoints Used
All endpoints from the web app:

**Authentication**
- `POST /api/auth/signin` - Login

**Tickets**
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `PATCH /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

**Sales**
- `GET /api/tickets/:id/sales` - List sales
- `POST /api/tickets/:id/sales` - Create sale
- `PATCH /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale
- `POST /api/sales/:id/toggle-sent` - Toggle sent status

**Platform Accounts**
- `GET /api/platform-accounts` - List accounts
- `POST /api/platform-accounts` - Create account
- `PATCH /api/platform-accounts/:id` - Update account
- `DELETE /api/platform-accounts/:id` - Delete account

---

## Security

### Keychain Integration
- Authentication tokens stored in iOS Keychain
- Secure enclave protection
- Automatic cleanup on logout

### API Security
- Bearer token authentication
- HTTPS enforcement in production
- Automatic token refresh handling

### Data Encryption
- Platform credentials encrypted server-side (AES-256-GCM)
- Decrypted on API response
- Never cached locally

---

## Development Tips

### Preview Support
All views include `#Preview` for Xcode previews:

```swift
#Preview {
    DashboardView()
        .environmentObject(AuthenticationManager())
        .environmentObject(ThemeManager())
}
```

### Debug API Calls
Add print statements in APIService:

```swift
print("Request: \(method) \(url)")
print("Response: \(String(data: data, encoding: .utf8) ?? "")")
```

### Test Different States
Mock data in previews:

```swift
#Preview {
    TicketCardView(ticket: mockTicket)
}
```

---

## Deployment to Production

The iOS app is designed to work seamlessly with your **Vercel-deployed backend**.

### Environment Configuration

The app automatically switches between environments:

**Development (Debug builds)**:
- Uses local Mac IP address
- Connects to `npm run dev` backend
- Configured in `Configuration.swift` line 32

**Production (Release builds)**:
- Uses Vercel deployment URL
- Connects to live backend
- Configured in `Configuration.swift` line 39

### Quick Production Setup

1. **Update Vercel URL** in `Utilities/Configuration.swift`:
```swift
case .production:
    return "https://your-domain.vercel.app"
```

2. **Verify Vercel backend** is deployed and running

3. **Archive app** in Xcode (Product → Archive)

4. **Upload to TestFlight** via App Store Connect

### Complete Production Guide

**See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for:**
- Full Vercel configuration
- TestFlight submission process
- App Store deployment
- Environment variable setup
- Testing production builds
- Troubleshooting production issues

### Deployment Checklist

Before deploying to production:
- [ ] Vercel backend URL updated in Configuration.swift
- [ ] Backend deployed and accessible via HTTPS
- [ ] Discord OAuth configured with production callback
- [ ] App icon added (1024x1024px)
- [ ] Bundle identifier set
- [ ] Version numbers configured
- [ ] Tested with production API

---

## Future Enhancements

Planned features for iOS app:

### Phase 1
- [ ] Widget support (upcoming events)
- [ ] Push notifications (delivery reminders)
- [ ] Share sheet integration
- [ ] Spotlight search integration

### Phase 2
- [ ] Apple Watch app
- [ ] Siri shortcuts
- [ ] Face ID / Touch ID
- [ ] Offline mode

### Phase 3
- [ ] iPad optimization
- [ ] macOS version (Catalyst)
- [ ] Live Activities
- [ ] Dynamic Island integration

---

## Troubleshooting

### Cannot Connect to API
- Ensure backend is running
- Check API_BASE_URL environment variable
- iOS simulator cannot use `localhost` from device - use computer's IP

### Authentication Fails
- Verify Discord OAuth is configured
- Check token is being saved to Keychain
- Clear Keychain and try again

### Build Errors
- Clean build folder (Cmd+Shift+K)
- Reset package caches
- Restart Xcode

---

## Contributing

The iOS app follows the same contribution guidelines as the web app. See main README.md for details.

---

## License

ISC License - Same as the main project

---

**Native iOS experience for professional ticket resellers**

*Built with SwiftUI for iOS 16+*

**Last Updated:** January 2025
