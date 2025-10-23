# 🎫 Ticket Platform

**The all-in-one platform for professional ticket resellers**

A powerful, modern web application built to solve the complexities of ticket reselling at scale. Whether you're managing dozens of events or thousands of tickets, this platform gives you complete control over your inventory, sales, and profits.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)](https://www.prisma.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)

---

## 🎯 What We're Building

The ticket reselling business is complex. You're managing:
- Purchases across multiple platforms (Ticketmaster, AXS, SeeTickets...)
- Sales to different buyers on different marketplaces (StubHub, Viagogo...)
- Accounts with 2FA codes you need to access constantly
- Profit calculations across different currencies
- Delivery tracking for multiple buyers per ticket order
- Upcoming events that need delivery reminders

**This platform solves all of that in one place.**

---

## ✨ What You Can Do

### 📊 Manage Your Entire Inventory
- Track every ticket with complete event details
- See total tickets, revenue, and profit at a glance
- Search and filter by artist, venue, platform, or status
- Multiple view modes: list, card, or detailed view

### 💰 Sell to Multiple Buyers Per Ticket Order
The game-changing feature that sets this platform apart:
- Buy 6 tickets, sell them to 3 different buyers
- Each sale tracks individually with its own buyer info and delivery details
- Profit automatically calculated per sale
- Always know how many tickets are left to sell
- Mark tickets as sent/not sent for each buyer
- Status updates automatically: Listed → Pending → Sold

**Example:** Buy 6 tickets for €300, sell 2 for $120, 3 for $195, and 1 for $70. Track each buyer separately, mark deliveries independently, and see your total profit automatically calculated.

### 🔐 Never Lose Track of Your Platform Accounts
- Store credentials for Ticketmaster, AXS, SeeTickets, StubHub, Viagogo, and more
- Everything encrypted with military-grade AES-256-GCM encryption
- Built-in 2FA authenticator - generate codes without switching apps
- Bulk import multiple accounts at once
- Organized by platform with tabs for easy access

### 💵 Work in Any Currency
- Buy in EUR, sell in USD, see profit in GBP - all automatic
- Supports 14 major currencies with real-time conversion
- Accurate profit calculations across different currencies
- No manual calculations needed

### 🤖 Discord Integration
- Automatic delivery reminders 7 days before events
- Each buyer gets their own personalized reminder
- Acknowledge deliveries right from Discord
- Full API for bot integration

### 🎨 Beautiful, Modern Interface
- Dark mode by default with smooth transitions
- Responsive design - works on desktop, tablet, and mobile
- Fast, intuitive, and built for productivity
- Clear visual feedback for all operations

---

## 🛠️ Built With Modern Technology

- **Next.js 15** + **React 19** - Latest web framework
- **TypeScript** - Type-safe development
- **PostgreSQL** (Neon) - Serverless database
- **Prisma** - Type-safe ORM
- **NextAuth.js v5** - Secure authentication
- **Tailwind CSS** - Beautiful, responsive design
- **AES-256-GCM** - Military-grade encryption

---

## 🚀 Getting Started

Ready to streamline your ticket business?

### Quick Setup

```bash
git clone https://github.com/DonkeyXBT/ticketplatform.git
cd ticketplatform
npm install
```

### Full Setup Instructions

See **[docs/SETUP.md](./docs/SETUP.md)** for complete installation and configuration guide including:
- Database setup (Neon PostgreSQL)
- Discord OAuth configuration
- Environment variables
- Deployment to Vercel

**Quick Links:**
- **[Setup Guide](./docs/SETUP.md)** - Complete installation instructions
- **[Discord OAuth Setup](./docs/DISCORD_SETUP.md)** - Detailed OAuth configuration

---

## 🛣️ What's Next

We're constantly improving the platform. Here's what's coming:

### Phase 1: Core Enhancements (Q1 2025)
- **Profit Analytics Dashboard** - Visual charts, ROI tracking, best-performing events
- **Bulk Operations** - CSV import/export, batch updates
- **Mobile PWA** - Native app experience on mobile devices

### Phase 2: Automation (Q2 2025)
- **Automated Price Monitoring** - Track market prices, get alerts for profitable opportunities
- **Marketplace Integration** - Auto-list on StubHub, Viagogo, sync inventory in real-time
- **Discord Bot Enhancements** - Create tickets via Discord, daily reports, team collaboration

### Phase 3: Intelligence (Q3 2025)
- **AI Event Recommendations** - Suggest profitable events based on your history
- **Price Prediction** - ML models to forecast profitability
- **Fraud Detection** - Protect against scams and suspicious buyers

### Phase 4: Enterprise (Q4 2025)
- **Multi-User Accounts** - Team management and collaboration
- **Financial Reports** - Automated invoicing, tax summaries, expense tracking
- **API Access** - Build custom integrations

**[See complete roadmap →](./docs/FEATURES.md)**

---

## 💡 Who This Is For

- **Professional Ticket Resellers** managing dozens of events per month
- **Teams** who need to collaborate on ticket inventory
- **Anyone** tired of spreadsheets and wants a proper business tool
- **Resellers** working across multiple platforms and currencies

---

## 🔐 Security & Privacy

Your data security is our priority:
- All platform credentials encrypted with **AES-256-GCM**
- 2FA secret keys never stored in plain text
- Secure Discord OAuth authentication
- User data isolation - you only see your data
- HTTPS enforced in production
- Regular security updates

---

## 🤝 Contributing

We welcome contributions! Whether it's:
- Reporting bugs
- Suggesting features
- Improving documentation
- Submitting pull requests

**[Open an issue](https://github.com/DonkeyXBT/ticketplatform/issues)** or **[start a discussion](https://github.com/DonkeyXBT/ticketplatform/discussions)**

---

## 📚 Documentation

- **[Setup Guide](./docs/SETUP.md)** - Installation and configuration
- **[Discord OAuth Setup](./docs/DISCORD_SETUP.md)** - Detailed OAuth guide
- **[Features Roadmap](./docs/FEATURES.md)** - Upcoming features and timeline

---

## 📄 License

ISC License - Free to use, modify, and distribute. See [LICENSE](./LICENSE) for details.

---

## 💬 Support

Need help or have questions?

- **[GitHub Issues](https://github.com/DonkeyXBT/ticketplatform/issues)** - Report bugs
- **[GitHub Discussions](https://github.com/DonkeyXBT/ticketplatform/discussions)** - Ask questions, share ideas

---

**Built for ticket resellers, by ticket resellers**

*Making ticket reselling simple, organized, and profitable.*

**Last Updated:** January 2025
