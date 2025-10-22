# Ticket Platform

A modern, full-stack web application for managing ticket purchases and sales. Track your tickets, calculate profits automatically, and manage your inventory across multiple platforms like Ticketmaster, AXS, Gigs And Tours, and more.

## Features

- **Discord OAuth Authentication** - Secure login with your Discord account
- **Ticket Management** - Add, edit, and delete tickets with comprehensive details
- **Automatic Profit Calculator** - Automatically calculates profit based on buy-in and sale prices
- **Platform Filtering** - Filter tickets by platform (Ticketmaster, AXS, SeeTickets, etc.)
- **Status Tracking** - Track ticket status (Listed, Sold, Pending, Cancelled)
- **Real-time Statistics** - View total tickets, revenue, and profit at a glance
- **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- **Search & Filter** - Quickly find tickets by artist, location, or order number

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5 (Auth.js) with Discord provider
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Neon database account (https://neon.tech)
- Discord Developer Application

### 1. Clone the repository

\`\`\`bash
git clone <your-repo-url>
cd ticketplatform
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set up your Neon Database

1. Go to https://console.neon.tech/
2. Create a new project
3. Copy your connection string

### 4. Set up Discord OAuth

1. Go to https://discord.com/developers/applications
2. Click "New Application" and give it a name
3. Go to the "OAuth2" section
4. Add redirect URL: \`http://localhost:3000/api/auth/callback/discord\`
5. Copy your Client ID and Client Secret

### 5. Configure environment variables

Update the \`.env\` file with your credentials:

\`\`\`env
# Database - Your Neon connection string
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
\`\`\`

### 6. Set up the database

\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Push the schema to your database
npx prisma db push
\`\`\`

### 7. Run the development server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Database Schema

The application uses the following main models:

- **User** - Stores user information and Discord auth data
- **Ticket** - Stores all ticket information including:
  - Event details (artist, location, date)
  - Seat information (section, row, seat)
  - Purchase info (platform, order number, buy-in price)
  - Sale info (status, sale price, profit, site sold)
  - Delivery details (email, name)

## Features in Detail

### Automatic Profit Calculation

The profit is automatically calculated whenever you enter or update the buy-in price and sale price:

\`\`\`
Profit = Sale Price - Buy-in Price
\`\`\`

### Supported Platforms

- Ticketmaster
- AXS
- Gigs And Tours
- SeeTickets
- Eventim
- Dice
- Stubhub
- Viagogo
- Other (custom)

### Ticket Statuses

- **Listed** - Ticket is available for sale
- **Sold** - Ticket has been sold
- **Pending** - Sale is in progress
- **Cancelled** - Ticket sale was cancelled

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add your environment variables
5. Deploy!

### Production Environment Variables

Make sure to add all environment variables from \`.env\` to your production environment:

- \`DATABASE_URL\`
- \`NEXTAUTH_URL\` (your production URL)
- \`NEXTAUTH_SECRET\`
- \`DISCORD_CLIENT_ID\`
- \`DISCORD_CLIENT_SECRET\`

Don't forget to update your Discord OAuth redirect URL to include your production domain!

## Project Structure

\`\`\`
ticketplatform/
├── app/
│   ├── (auth)/
│   │   └── login/         # Login page
│   ├── (dashboard)/
│   │   └── dashboard/     # Main dashboard
│   ├── api/
│   │   ├── auth/          # NextAuth routes
│   │   └── tickets/       # Ticket API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects)
├── components/
│   ├── DashboardClient.tsx  # Main dashboard component
│   └── TicketModal.tsx      # Add/Edit ticket modal
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   └── prisma.ts          # Prisma client
├── prisma/
│   └── schema.prisma      # Database schema
├── types/
│   └── next-auth.d.ts     # NextAuth type extensions
└── package.json
\`\`\`

## Contributing

Feel free to submit issues and enhancement requests!

## License

ISC

## Support

For questions or issues, please open an issue on GitHub.
