# Complete Setup Guide

This guide will walk you through setting up the Ticket Platform from scratch.

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** and npm installed
- A **[Neon](https://neon.tech)** database account (free tier available)
- A **Discord Developer Application** for OAuth authentication

---

## Installation Steps

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/DonkeyXBT/ticketplatform.git
cd ticketplatform
npm install
```

### 2. Set Up Neon Database

1. Go to https://console.neon.tech/ and sign in
2. Click **"Create Project"**
3. Give it a name (e.g., "Ticket Platform")
4. Copy your connection string from the dashboard
   - It looks like: `postgresql://user:password@host/database?sslmode=require`
5. Save this for the next step

### 3. Configure Discord OAuth

See **[DISCORD_SETUP.md](./DISCORD_SETUP.md)** for detailed instructions.

Quick summary:
1. Go to https://discord.com/developers/applications
2. Create a **New Application**
3. Navigate to **OAuth2**
4. Add redirect URLs:
   - Development: `http://localhost:3000/api/auth/callback/discord`
   - Production: `https://your-domain.com/api/auth/callback/discord`
5. Copy your **Client ID** and **Client Secret**

### 4. Environment Variables

Create or update the `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Discord OAuth Credentials
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Encryption Key (for platform account credentials)
ENCRYPTION_KEY="your-encryption-key-here"

# Discord Bot API (optional)
BOT_API_KEY="your-bot-api-key"
```

#### Generate Secure Secrets

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

Generate `ENCRYPTION_KEY`:
```bash
openssl rand -hex 32
```

### 5. Initialize Database

Run these commands to set up your database schema:

```bash
npx prisma generate
npx prisma db push
```

This will:
- Generate the Prisma client
- Create all necessary tables in your Neon database
- Set up indexes for optimal performance

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the login page. Click **"Sign in with Discord"** to get started!

---

## Project Structure

```
ticketplatform/
├── app/
│   ├── (auth)/
│   │   └── login/              # Discord OAuth login page
│   ├── (dashboard)/
│   │   ├── dashboard/          # Main ticket management dashboard
│   │   ├── events/             # Events overview page
│   │   └── accounts/           # Platform accounts with 2FA
│   ├── api/
│   │   ├── auth/               # NextAuth.js authentication routes
│   │   ├── tickets/            # Ticket CRUD operations
│   │   ├── sales/              # Partial sales management
│   │   ├── platform-accounts/  # Encrypted account storage
│   │   └── bot/                # Discord bot integration
│   ├── globals.css             # Global styles and Tailwind
│   ├── layout.tsx              # Root layout with theme provider
│   └── page.tsx                # Landing page
├── components/
│   ├── DashboardClient.tsx     # Main dashboard UI
│   ├── TicketModal.tsx         # Add/edit ticket modal
│   ├── SalesManager.tsx        # Multi-buyer sales management
│   ├── AccountsClient.tsx      # Platform accounts UI
│   ├── TOTPDisplay.tsx         # Live 2FA code generator
│   ├── Navigation.tsx          # Global navigation bar
│   └── ThemeProvider.tsx       # Dark mode provider
├── lib/
│   ├── auth.ts                 # NextAuth.js configuration
│   ├── prisma.ts               # Prisma client singleton
│   ├── currency.ts             # Currency conversion
│   └── encryption.ts           # AES-256-GCM encryption
├── prisma/
│   └── schema.prisma           # Database schema
├── types/
│   └── next-auth.d.ts          # NextAuth TypeScript types
├── docs/
│   ├── SETUP.md                # This file
│   ├── DISCORD_SETUP.md        # Discord OAuth setup guide
│   └── FEATURES.md             # Future roadmap
├── .env                        # Environment variables (gitignored)
└── README.md                   # Project overview
```

---

## Database Schema

The application uses four main models:

### User
- Discord ID and OAuth data
- Preferred currency setting
- Relations to tickets, sales, and platform accounts

### Ticket
- Event details: artist, location, date, section, row, seat
- Purchase info: platform, quantity, buy price, currency
- Status: Listed, Pending (partially sold), Sold
- One-to-many relationship with Sales

### Sale
- Individual sale to a specific buyer
- Quantity sold, sale price, calculated profit
- Buyer information: name, email
- Delivery tracking: tickets sent status
- Platform sold on

### PlatformAccount
- Encrypted credential storage
- Platform identifier (Ticketmaster, AXS, etc.)
- Encrypted email, password, and 2FA secret
- Optional phone number and notes

---

## API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js routes

### Tickets
- `GET /api/tickets` - List all tickets with sales
- `POST /api/tickets` - Create new ticket
- `PATCH /api/tickets/[id]` - Update ticket
- `DELETE /api/tickets/[id]` - Delete ticket

### Sales
- `GET /api/tickets/[id]/sales` - List sales for a ticket
- `POST /api/tickets/[id]/sales` - Create sale (auto-validates quantity)
- `PATCH /api/sales/[id]` - Update sale
- `DELETE /api/sales/[id]` - Delete sale
- `POST /api/sales/[id]/toggle-sent` - Toggle tickets sent status

### Platform Accounts
- `GET /api/platform-accounts` - List accounts (auto-decrypted)
- `POST /api/platform-accounts` - Create account (auto-encrypted)
- `PATCH /api/platform-accounts/[id]` - Update account
- `DELETE /api/platform-accounts/[id]` - Delete account
- `POST /api/platform-accounts/bulk` - Bulk import accounts

### Discord Bot
- `GET /api/bot/tickets-needing-reminders` - Fetch upcoming events
- `POST /api/bot/update-reminder-sent` - Mark reminder as sent
- `POST /api/bot/acknowledge-delivery` - Acknowledge delivery

---

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your repository

3. **Environment Variables**

   Add all variables from `.env`:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (use your production domain)
   - `NEXTAUTH_SECRET`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `ENCRYPTION_KEY`
   - `BOT_API_KEY` (optional)

4. **Update Discord OAuth**

   Add your production redirect URL:
   - Go to Discord Developer Portal
   - Add: `https://your-domain.vercel.app/api/auth/callback/discord`

5. **Deploy!**

### Other Platforms

The app works with:
- **Netlify** - Full Next.js support
- **Railway** - One-click deploy
- **Render** - Static + dynamic rendering
- **AWS Amplify** - Serverless deployment
- **Self-hosted** - `npm run build && npm start`

---

## Security

### Encryption
- Platform credentials encrypted with AES-256-GCM
- Unique initialization vector (IV) per encrypted value
- 32-byte (64 hex character) encryption key required

### Authentication
- Discord OAuth for secure authentication
- NextAuth.js v5 session management
- All API routes protected with middleware
- User data isolation at database level

### Production
- Always use HTTPS
- Never commit `.env` files
- Rotate encryption keys periodically
- Keep dependencies updated

---

## Troubleshooting

### Database Connection Failed
- Verify `DATABASE_URL` is correct
- Check Neon database is running
- Ensure `?sslmode=require` is in connection string

### Discord OAuth Error
- Verify redirect URLs match exactly
- Check Client ID and Secret are correct
- Ensure `NEXTAUTH_URL` matches your domain

### Encryption Errors
- Ensure `ENCRYPTION_KEY` is exactly 64 hex characters
- Generate new key: `openssl rand -hex 32`
- Changing keys makes old encrypted data unreadable

### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npx prisma generate
npm run build
```

---

## Development Tools

### Prisma Studio
View and edit database data:
```bash
npx prisma studio
```

Opens at http://localhost:5555

### Database Migration
After changing `prisma/schema.prisma`:
```bash
npx prisma generate  # Regenerate client
npx prisma db push   # Push changes to database
```

### Hot Reload
- Component changes: Instant reload
- API routes: Automatic restart
- Environment variables: Manual restart required

---

## Support

Need help? Check these resources:

1. **[Discord OAuth Setup](./DISCORD_SETUP.md)** - Detailed OAuth guide
2. **[GitHub Issues](https://github.com/DonkeyXBT/ticketplatform/issues)** - Report bugs
3. **[GitHub Discussions](https://github.com/DonkeyXBT/ticketplatform/discussions)** - Ask questions

---

**Last Updated:** January 2025
