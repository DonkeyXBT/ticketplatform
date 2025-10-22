# Quick Setup Guide

Follow these steps to get your Ticket Platform running:

## 1. Set Up Neon Database (2 minutes)

**📖 Detailed guide**: See `NEON_DATABASE_SETUP.md` for complete step-by-step instructions!

**Quick steps:**
1. Go to **https://console.neon.tech/**
2. Sign up / Login
3. Click "Create Project" → Name it "ticketplatform"
4. Choose your region (closest to you)
5. Copy the connection string (starts with `postgresql://...`)
6. **IMPORTANT**: Make sure it ends with `?sslmode=require`

## 2. Set Up Discord OAuth (3 minutes)

**📖 See detailed guide**: Check `DISCORD_SETUP.md` for step-by-step instructions with screenshots!

**Quick steps:**
1. Go to **https://discord.com/developers/applications**
2. Click "New Application" → Name it "Ticket Platform"
3. Go to "OAuth2" → Copy Client ID and Client Secret
4. Add redirect URLs:
   - `http://localhost:3000/api/auth/callback/discord` (for local)
   - `https://ticketplatform.vercel.app/api/auth/callback/discord` (for production)
5. Click "Save Changes"

## 3. Configure Environment Variables (1 minute)

Edit the `.env` file in the project root:

```env
# Paste your Neon connection string here
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Keep this as is for local development
NEXTAUTH_URL="http://localhost:3000"

# Generate a secure secret (or use the command below)
NEXTAUTH_SECRET="your-generated-secret"

# Paste your Discord credentials here
DISCORD_CLIENT_ID="your-client-id-here"
DISCORD_CLIENT_SECRET="your-client-secret-here"
```

**To generate NEXTAUTH_SECRET**, run this command:
```bash
openssl rand -base64 32
```

## 4. Initialize Database (30 seconds)

### Option 1: Use the setup script (recommended)
```bash
./setup-database.sh
```

### Option 2: Manual setup
```bash
npx prisma generate
npx prisma db push
```

This creates all 5 tables in your Neon database:
- ✅ User (authentication)
- ✅ Account (OAuth)
- ✅ Session (login sessions)
- ✅ VerificationToken (security)
- ✅ Ticket (your ticket data with 18 fields)

## 5. Start the Application (10 seconds)

```bash
npm run dev
```

## 6. Open Your Browser

Go to **http://localhost:3000**

You'll be redirected to the login page. Click "Sign in with Discord" and you're ready!

---

## Troubleshooting

### "Unauthorized" when logging in
- Make sure your Discord redirect URL is exactly: `http://localhost:3000/api/auth/callback/discord`
- Check that your Discord Client ID and Secret are correct in `.env`

### Database connection error
- Verify your Neon connection string in `.env`
- Make sure it includes `?sslmode=require` at the end
- Check that your Neon project is active

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

---

## What's Next?

Once you're logged in, you can:
- **Add tickets** using the "Add Ticket" button
- **Filter** by platform or status
- **Search** for specific events
- **View statistics** at the top of the dashboard
- **Edit or delete** tickets using the action buttons

The profit is automatically calculated whenever you enter buy-in and sale prices!

---

## Deploy to Production

When you're ready to deploy:

1. Push your code to GitHub (already done!)
2. Go to **https://vercel.com**
3. Import your repository
4. Add all environment variables from `.env`
5. Update `NEXTAUTH_URL` to your production domain
6. Update Discord redirect URL to include production domain
7. Deploy!

Enjoy your Ticket Platform! 🎫
