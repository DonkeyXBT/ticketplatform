# Discord Bot Setup Guide

This guide will help you set up the standalone Discord bot for ticket delivery reminders.

## Features

- 🔔 Automatic daily reminders for sold tickets 7 days before the event
- 📱 Direct messages to users via Discord
- ✅ One-click acknowledgment to stop reminders
- 🎯 Smart tracking to avoid duplicate notifications
- 🚀 Runs independently on your own server

## Architecture

The bot runs as a **standalone application** on a separate server and communicates with your ticket platform via secure API endpoints.

## Prerequisites

1. A Discord account
2. Administrator access to a Discord server (or create your own)
3. A server to host the bot (VPS, Railway, Render, etc.)
4. Access to your Vercel deployment settings

## Step 1: Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Give it a name (e.g., "Ticket Reminder Bot")
4. Click **Create**

## Step 2: Configure Bot Settings

1. In your application, go to the **"Bot"** tab on the left sidebar
2. Click **"Add Bot"** and confirm
3. Under the bot's username, click **"Reset Token"** and copy the token
   - ⚠️ **IMPORTANT:** Save this token securely - you'll need it for environment variables
   - Never share this token publicly

4. Scroll down to **"Privileged Gateway Intents"** and enable:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

5. Click **"Save Changes"**

## Step 3: Invite Bot to Your Server

1. Go to the **"OAuth2"** tab
2. Click **"URL Generator"**
3. Under **"Scopes"**, select:
   - ✅ `bot`
4. Under **"Bot Permissions"**, select:
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Add Reactions
   - ✅ Use External Emojis
5. Copy the generated URL at the bottom
6. Open the URL in your browser and select your server
7. Click **"Authorize"**

## Step 4: Get Your Discord User ID

1. Open Discord
2. Go to **User Settings** → **Advanced**
3. Enable **Developer Mode**
4. Right-click your username anywhere and select **"Copy User ID"**
5. Save this ID - it will be stored in your user profile

## Step 5: Configure Environment Variables

Add these to your `.env` file and Vercel environment variables:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
CRON_SECRET=your_random_secret_here

# App URL (for production)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Generating CRON_SECRET

Run this command to generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 6: Link Discord ID to Your Account

1. Log in to your ticket platform
2. Go to your profile settings
3. Enter your Discord User ID (from Step 4)
4. Save your profile

## Step 7: Set Up Bot API Key

Generate a secure API key for bot authentication:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Add API Key to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - Key: `BOT_API_KEY`
   - Value: The API key you just generated
   - Select all environments (Production, Preview, Development)

⚠️ **Important:** Save this API key - you'll need it when setting up the standalone bot

## Step 8: Deploy Main App

1. Commit all changes to Git
2. Push to your repository
3. Vercel will automatically deploy

## Step 9: Set Up Standalone Bot

The Discord bot runs as a **separate application** on your own server. This provides better reliability and control.

**📚 See the complete bot setup guide:** [`discord-bot/README.md`](./discord-bot/README.md)

### Quick Start

1. Navigate to the `discord-bot` directory
2. Copy `.env.example` to `.env` and configure:
   ```env
   DISCORD_BOT_TOKEN=your_bot_token_from_step_2
   API_URL=https://your-app.vercel.app
   API_KEY=same_as_BOT_API_KEY_from_step_7
   ```
3. Install dependencies: `npm install`
4. Run the bot: `npm start`

### Hosting Options

Choose one of these free/low-cost options:

- **Railway.app** - Free tier available, easy deployment
- **Render.com** - Free background workers
- **Your VPS** - Use PM2 for process management
- **Docker** - Run anywhere with Docker support

See [`discord-bot/README.md`](./discord-bot/README.md) for detailed deployment instructions.

## How It Works

### Automatic Reminders

1. **Every day at 9 AM UTC**, the cron job checks for:
   - Tickets with status: "Sold"
   - Event date within the next 7 days
   - Not yet acknowledged by the user

2. **If tickets are found**, the bot:
   - Sends a DM to the user on Discord
   - Includes event details (artist, date, location, seat info)
   - Provides buyer information (name, email)
   - Shows a "Done" button

3. **Daily reminders continue** until:
   - User clicks the "Done" button
   - Event date passes

### Acknowledging Delivery

When you've sent the tickets to your buyer:

1. Open the Discord message from the bot
2. Click the **"✅ Done"** button
3. The message will update to confirm
4. You'll stop receiving reminders for that ticket

## Testing Locally

To test the bot locally:

1. Create a `.env.local` file with your environment variables
2. Run the development server:
   ```bash
   npm run dev
   ```

3. Manually trigger the cron job:
   ```bash
   curl -X GET "http://localhost:3000/api/cron/check-delivery-reminders" \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

4. Create a test ticket:
   - Set status to "Sold"
   - Set event date to 6 days from now
   - Ensure your Discord ID is linked to your account

## Troubleshooting

### Bot not sending messages

1. **Check bot token**
   - Ensure `DISCORD_BOT_TOKEN` is correctly set in Vercel
   - Token should not have any extra spaces

2. **Check bot permissions**
   - Bot must be in your Discord server
   - Bot needs permission to send DMs

3. **Check Discord ID**
   - Your Discord User ID must be saved in your profile
   - Make sure Developer Mode is enabled to copy the correct ID

4. **Check cron job**
   - Verify `CRON_SECRET` matches in both cron request and environment variables
   - Check Vercel logs for any errors

### Messages not being received

1. **Check Discord DM settings**
   - Server Settings → Privacy & Safety
   - Enable "Allow direct messages from server members"

2. **Verify user has server in common with bot**
   - You must be in the same server as the bot

### Button not working

1. **Check app URL**
   - Ensure `NEXT_PUBLIC_APP_URL` is set correctly
   - Should match your production domain

2. **Check Discord ID matches**
   - The Discord ID in your profile must match your actual Discord user ID

## Security Notes

- ⚠️ Never commit `.env` files to Git
- ⚠️ Keep your Discord bot token secret
- ⚠️ Use a strong random string for `CRON_SECRET`
- ⚠️ Only share your bot token in secure environment variable settings

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Discord bot console in Developer Portal
3. Verify all environment variables are set correctly
4. Ensure database schema is up to date with `npx prisma db push`
