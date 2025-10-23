# 🎫 Ticket Platform

> A modern, full-stack web application for professional ticket resellers. Track inventory, manage multiple buyers per ticket, calculate profits automatically, and streamline your ticket business across all major platforms.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)](https://www.prisma.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)

---

## 🌟 Key Features

### 📊 **Ticket Management**
- **Add, Edit, Delete** tickets with comprehensive event details
- **Quantity Tracking** - Know exactly how many tickets you have
- **Multiple View Modes** - List, Card, or Detailed view
- **Real-time Statistics** - Total tickets, revenue, and profit at a glance
- **Search & Filter** - Quickly find tickets by artist, location, platform, or status

### 💰 **Partial Sales System**
- **Sell to Multiple Buyers** - Split a 6-ticket order across multiple buyers
- **Individual Sale Tracking** - Each sale has its own buyer info and delivery details
- **Automatic Calculations** - Profit calculated per sale automatically
- **Remaining Quantity** - Always know how many tickets are left to sell
- **Ticket Sent Tracking** - Mark tickets as sent/not sent per buyer
- **Status Auto-Updates** - Listed → Pending → Sold based on sales

### 🔐 **Platform Account Management**
- **Secure Credential Storage** - AES-256-GCM encrypted passwords and 2FA keys
- **Multi-Platform Support** - Ticketmaster, AXS, SeeTickets, Stubhub, Viagogo, and more
- **Live 2FA Code Generator** - Built-in authenticator with 30-second rotation
- **Bulk Import** - Add multiple accounts at once via textarea
- **QR Code Generation** - Easy setup with authenticator apps
- **Tab Organization** - Separate tabs for each platform

### 💵 **Multi-Currency Support**
- **14 Major Currencies** - USD, EUR, GBP, JPY, and more
- **Real-time Conversion** - Automatic conversion for profit calculations
- **Per-Ticket Pricing** - Buy and sell in different currencies
- **Accurate Profit** - Currency conversion handled automatically

### 🤖 **Discord Bot Integration**
- **Delivery Reminders** - Automatic reminders 7 days before events
- **Per-Sale Notifications** - Each buyer gets their own reminder
- **Acknowledgment System** - Mark reminders as acknowledged
- **Bot API Endpoints** - Fully integrated with Discord bot

### 🎨 **Modern UI/UX**
- **Dark Mode Support** - Beautiful dark theme with smooth transitions
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Gradient Styling** - Modern gradient effects throughout
- **Animated Components** - Smooth animations and transitions
- **Loading States** - Clear feedback for all operations

### 🔒 **Security & Authentication**
- **Discord OAuth** - Secure login with your Discord account
- **NextAuth.js v5** - Latest Auth.js implementation
- **Encrypted Storage** - Sensitive data encrypted at rest
- **User Isolation** - Each user sees only their own data

---

## 🚀 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15 with React 19, TypeScript |
| **Styling** | Tailwind CSS with custom theme |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma 6 |
| **Authentication** | NextAuth.js v5 (Auth.js) |
| **2FA Generation** | OTPAuth library |
| **Encryption** | AES-256-GCM (Node.js crypto) |
| **Icons** | Lucide React |
| **Date Handling** | date-fns |

---

## 📦 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A [Neon](https://neon.tech) database account (free tier works great!)
- Discord Developer Application

### 1. Clone & Install

```bash
git clone https://github.com/DonkeyXBT/ticketplatform.git
cd ticketplatform
npm install
```

### 2. Set Up Neon Database

1. Go to https://console.neon.tech/
2. Create a new project
3. Copy your connection string

### 3. Set Up Discord OAuth

**📖 Detailed guide available in `DISCORD_SETUP.md`**

Quick steps:
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Go to OAuth2 → Add redirect URLs:
   - `http://localhost:3000/api/auth/callback/discord`
   - `https://your-domain.com/api/auth/callback/discord` (for production)
4. Copy Client ID and Client Secret

### 4. Configure Environment Variables

Update `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Encryption Key (for platform accounts)
ENCRYPTION_KEY="generate-with-openssl-rand-hex-32"

# Discord Bot API (optional)
BOT_API_KEY="your-bot-api-key"
```

### 5. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📚 Core Concepts

### Ticket Flow

```
1. Create Ticket (6 tickets, $300 total buy-in)
   ↓
2. Add Sale #1 (2 tickets to Buyer A @ $60 each = $120)
   ↓
3. Add Sale #2 (3 tickets to Buyer B @ $65 each = $195)
   ↓
4. Remaining: 1 ticket
   Status: Pending (partially sold)
   ↓
5. Add Sale #3 (1 ticket to Buyer C @ $70)
   ↓
6. Status: Sold (all tickets sold)
   Total Revenue: $385
   Total Profit: $85
```

### Platform Accounts

Store credentials for all your ticket platforms:
- **Encrypted Storage** - Passwords and 2FA keys encrypted with AES-256-GCM
- **Live Authenticator** - Generate 2FA codes without leaving the app
- **Bulk Import** - Format: `email:password:2fa_key:phone_number`

### Currency Conversion

Buy in EUR, sell in USD - profit calculated automatically:
```
Buy: 6 tickets @ €50 each = €300
Sell: 6 tickets @ $65 each = $390
Profit: ~$65 (after EUR→USD conversion)
```

---

## 🗂️ Project Structure

```
ticketplatform/
├── app/
│   ├── (auth)/
│   │   └── login/              # Login page
│   ├── (dashboard)/
│   │   ├── dashboard/          # Main dashboard
│   │   ├── events/             # Events page
│   │   └── accounts/           # Platform accounts
│   ├── api/
│   │   ├── auth/               # NextAuth routes
│   │   ├── tickets/            # Ticket CRUD
│   │   ├── sales/              # Sales management
│   │   ├── platform-accounts/  # Account CRUD
│   │   └── bot/                # Discord bot endpoints
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DashboardClient.tsx     # Main dashboard UI
│   ├── TicketModal.tsx         # Add/edit tickets
│   ├── SalesManager.tsx        # Manage sales per ticket
│   ├── AccountsClient.tsx      # Platform accounts UI
│   ├── TOTPDisplay.tsx         # 2FA code generator
│   ├── Navigation.tsx          # Global navigation
│   └── ThemeProvider.tsx       # Dark mode provider
├── lib/
│   ├── auth.ts                 # NextAuth config
│   ├── prisma.ts               # Prisma client
│   ├── currency.ts             # Currency conversion
│   └── encryption.ts           # AES-256-GCM encryption
├── prisma/
│   └── schema.prisma           # Database schema
└── types/
    └── next-auth.d.ts          # NextAuth types
```

---

## 🎯 Supported Platforms

### Purchase Platforms
- Ticketmaster
- AXS
- Gigs And Tours
- SeeTickets
- Eventim
- Dice
- Other (custom)

### Sale Platforms
- Stubhub
- Viagogo
- Ticketmaster Resale
- AXS Resale
- Twickets
- Other (custom)

---

## 📊 Database Schema

### Main Models

#### **Ticket**
Event information and purchase details
- Event: artist, location, date, section, row, seat
- Purchase: platform, quantity, buy price, currency
- Meta: status, order number, email

#### **Sale**
Individual sales per ticket (one-to-many)
- Quantity sold to this buyer
- Sale price and profit
- Buyer details (name, email)
- Delivery tracking (sent/not sent)
- Site sold on

#### **PlatformAccount**
Encrypted credential storage
- Platform identifier
- Encrypted email and password
- Encrypted 2FA secret key
- Phone number, notes

#### **User**
User profile and authentication
- Discord ID and auth data
- Preferred currency
- Linked tickets and accounts

---

## 🚢 Deployment

### Deploy to Vercel

**Optimized for Vercel** - Middleware is only 33.8 kB (well under 1 MB limit)

1. Push your code to GitHub
2. Go to https://vercel.com and import repository
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your production domain)
   - `NEXTAUTH_SECRET`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `ENCRYPTION_KEY`
   - `BOT_API_KEY` (optional)
4. Deploy! 🎉

**Don't forget** to add your production URL to Discord OAuth redirect URLs!

### Other Platforms

The app is a standard Next.js 15 application and works with:
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted with Node.js

---

## 🔌 API Endpoints

### Tickets
- `GET /api/tickets` - List all tickets with sales
- `POST /api/tickets` - Create ticket
- `PATCH /api/tickets/[id]` - Update ticket
- `DELETE /api/tickets/[id]` - Delete ticket

### Sales
- `GET /api/tickets/[id]/sales` - List sales for ticket
- `POST /api/tickets/[id]/sales` - Create sale
- `PATCH /api/sales/[id]` - Update sale
- `DELETE /api/sales/[id]` - Delete sale
- `POST /api/sales/[id]/toggle-sent` - Toggle sent status

### Platform Accounts
- `GET /api/platform-accounts` - List accounts (decrypted)
- `POST /api/platform-accounts` - Create account (encrypted)
- `PATCH /api/platform-accounts/[id]` - Update account
- `DELETE /api/platform-accounts/[id]` - Delete account
- `POST /api/platform-accounts/bulk` - Bulk import

### Discord Bot
- `GET /api/bot/tickets-needing-reminders` - Fetch sales needing reminders
- `POST /api/bot/update-reminder-sent` - Mark reminder as sent
- `POST /api/bot/acknowledge-delivery` - Acknowledge reminder

---

## 🎨 Features in Detail

### Profit Calculator

Automatic profit calculation with currency conversion:

```typescript
// Buy in EUR, sell in USD
buyInPrice: €300 (EUR)
salePrice: $390 (USD)

// Auto-converts USD → EUR for profit
profit: ~€358 - €300 = €58
```

### View Modes

- **List View** - Compact table with all info
- **Card View** - Medium cards with key details
- **Detailed View** - Large cards with full information

### Quantity Tracking

```
Total: 6 tickets
Sold: 5 tickets (via 2 sales)
Remaining: 1 ticket
Status: Pending
```

### Sales Manager

Per-ticket sales interface:
1. View all sales for a ticket
2. Add new sale (validates quantity)
3. Edit/delete existing sales
4. Toggle sent status per sale
5. See buyer details and delivery info

---

## 🔐 Security Features

- **Password Encryption** - AES-256-GCM with unique IVs
- **2FA Key Encryption** - Secrets never stored in plain text
- **User Isolation** - Middleware enforces data separation
- **HTTPS Only** - Force HTTPS in production
- **CSRF Protection** - Built into NextAuth.js
- **SQL Injection Prevention** - Prisma ORM parameterized queries

---

## 🛣️ Roadmap

See [FEATURES.md](./FEATURES.md) for the complete list of planned features, including:

- 🔥 Automated price monitoring & alerts
- 📊 Profit analytics dashboard
- 📱 Mobile app (PWA)
- 🤖 Marketplace auto-listing
- 🧠 AI event recommendations
- 💼 CRM & buyer management

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

ISC License - see [LICENSE](./LICENSE) file for details

---

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/DonkeyXBT/ticketplatform/issues)
- **Discussions:** [GitHub Discussions](https://github.com/DonkeyXBT/ticketplatform/discussions)
- **Documentation:** See `DISCORD_SETUP.md` for Discord OAuth setup

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Neon](https://neon.tech/) - PostgreSQL database
- [Lucide](https://lucide.dev/) - Icons
- [OTPAuth](https://github.com/hectorm/otpauth) - TOTP generation

---

**Made with ❤️ for ticket resellers**

**Last Updated:** January 2025
