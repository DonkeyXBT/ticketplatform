# Quick Setup Guide

Follow these steps to get your Ticket Platform running:

## 1. Set Up Neon Database (2 minutes)

1. Go to **https://console.neon.tech/**
2. Click "Create Project"
3. Choose a name (e.g., "ticketplatform")
4. Click "Create Project"
5. Copy the connection string that appears

## 2. Set Up Discord OAuth (3 minutes)

1. Go to **https://discord.com/developers/applications**
2. Click "New Application"
3. Name it "Ticket Platform" (or whatever you like)
4. Go to "OAuth2" in the left sidebar
5. Click "Add Redirect" and add: `http://localhost:3000/api/auth/callback/discord`
6. Copy your **Client ID** and **Client Secret**

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

```bash
npx prisma db push
```

This creates all the necessary tables in your Neon database.

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
