# Ticket Delivery Reminder Bot

A standalone Discord bot that sends automated daily reminders for ticket deliveries.

## Features

- 🔔 Automated daily reminders for sold tickets 7 days before the event
- 📱 Direct messages (DMs) to users via Discord
- ✅ One-click acknowledgment button to stop reminders
- 🎯 Smart tracking to prevent duplicate notifications
- ⏰ Scheduled to run daily at 9:00 AM UTC
- 🔒 Secure API communication with your ticket platform

## How It Works

1. Bot runs continuously on your server
2. Every day at 9:00 AM UTC, checks for tickets needing reminders via API
3. Sends DM to each user with ticket and buyer details
4. User clicks "Done" button when tickets are sent
5. Bot updates database via API to stop future reminders

## Prerequisites

- Node.js 18 or higher
- Discord bot token from Discord Developer Portal
- Access to your ticket platform API
- API key for authentication

## Setup Instructions

### Step 1: Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Give it a name (e.g., "Ticket Reminder Bot")
4. Go to the **"Bot"** tab and click **"Add Bot"**
5. Under the bot's username, click **"Reset Token"** and copy the token
   - ⚠️ Save this securely - you'll need it for `.env`

6. Enable these **Privileged Gateway Intents**:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

7. Click **"Save Changes"**

### Step 2: Invite Bot to Server

1. Go to the **"OAuth2"** → **"URL Generator"** tab
2. Under **"Scopes"**, select:
   - ✅ `bot`
3. Under **"Bot Permissions"**, select:
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Add Reactions
4. Copy the generated URL and open it in your browser
5. Select your Discord server and authorize

### Step 3: Generate API Key

Run this command to generate a secure API key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save this key - you'll need it in two places:
1. Bot's `.env` file (as `API_KEY`)
2. Main app's environment variables (as `BOT_API_KEY`)

### Step 4: Configure Environment Variables

1. Navigate to the `discord-bot` directory
2. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

3. Edit `.env` with your values:

```env
# Discord Bot Token from Step 1
DISCORD_BOT_TOKEN=your_bot_token_here

# Your Next.js app URL
API_URL=https://ticketplatform.vercel.app

# API Key from Step 3
API_KEY=your_api_key_here
```

### Step 5: Configure Main App

Add the API key to your main app's environment variables:

**Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add:
   - Key: `BOT_API_KEY`
   - Value: (same as `API_KEY` from Step 3)
   - Environments: Production, Preview, Development

**Local Development:**
Add to your `.env` file:

```env
BOT_API_KEY=your_api_key_here
```

### Step 6: Install Dependencies

```bash
cd discord-bot
npm install
```

### Step 7: Run the Bot

**Development (with auto-restart):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## Deployment Options

### Option 1: VPS or Dedicated Server

1. Upload bot files to your server
2. Install Node.js and dependencies
3. Use PM2 to keep bot running:

```bash
# Install PM2 globally
npm install -g pm2

# Start bot with PM2
pm2 start index.js --name ticket-bot

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

**Useful PM2 Commands:**
```bash
pm2 status              # Check bot status
pm2 logs ticket-bot     # View logs
pm2 restart ticket-bot  # Restart bot
pm2 stop ticket-bot     # Stop bot
```

### Option 2: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

CMD ["node", "index.js"]
```

Build and run:

```bash
docker build -t ticket-bot .
docker run -d --name ticket-bot --env-file .env ticket-bot
```

### Option 3: Railway.app (Free Hosting)

1. Push bot code to GitHub repository
2. Go to [Railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository and `discord-bot` directory
5. Add environment variables in Railway dashboard
6. Deploy!

### Option 4: Render.com (Free Hosting)

1. Push bot code to GitHub
2. Go to [Render.com](https://render.com)
3. Click "New" → "Background Worker"
4. Connect your repository
5. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
6. Add environment variables
7. Deploy!

## Testing

### Test Bot Locally

1. Start your bot:
   ```bash
   npm run dev
   ```

2. Bot will check for reminders immediately on startup

3. Create a test ticket in your platform:
   - Status: "Sold"
   - Event date: 6 days from now
   - Make sure your Discord ID is linked to your account

4. Check bot console for logs

5. You should receive a DM from the bot

### Manual API Test

Test if bot can access your API:

```bash
curl -X GET "https://your-app.vercel.app/api/bot/tickets-needing-reminders" \
  -H "X-API-Key: your_api_key"
```

Should return JSON with tickets list.

## Troubleshooting

### Bot not starting

**Check:**
- Is `DISCORD_BOT_TOKEN` correct?
- Are all dependencies installed?
- Is Node.js version 18 or higher?

**Solution:**
```bash
npm install
node --version  # Should be v18 or higher
```

### Bot can't fetch tickets

**Error:** `401 Unauthorized`

**Check:**
- Is `API_KEY` in bot's `.env` correct?
- Is `BOT_API_KEY` set in main app?
- Do both keys match exactly?

**Solution:**
- Regenerate API key and update both places
- Redeploy main app after updating `BOT_API_KEY`

### Messages not being received

**Check:**
1. **Discord DM Settings:**
   - Server Settings → Privacy & Safety
   - Enable "Allow direct messages from server members"

2. **Bot and User in Same Server:**
   - You must share a server with the bot

3. **Bot Permissions:**
   - Bot needs "Send Messages" permission
   - Check bot role in server settings

### Button not working

**Error when clicking "Done"**

**Check:**
- Is `API_URL` correct in bot's `.env`?
- Is main app deployed and accessible?
- Does Discord User ID in profile match actual Discord ID?

**Solution:**
1. Verify `API_URL` points to deployed app
2. Check main app logs for errors
3. Ensure user's Discord ID is saved in profile

### Bot offline/crashed

**Using PM2:**
```bash
pm2 logs ticket-bot  # Check error logs
pm2 restart ticket-bot
```

**Using Docker:**
```bash
docker logs ticket-bot
docker restart ticket-bot
```

## Monitoring

### Check Bot Status

The bot logs important events:

- ✅ Successfully sent reminders
- ❌ Errors sending messages
- 📝 User acknowledgments
- 🔍 Daily check summaries

### View Logs

**PM2:**
```bash
pm2 logs ticket-bot --lines 100
```

**Docker:**
```bash
docker logs -f ticket-bot
```

**Railway/Render:**
Check deployment logs in their dashboard

## Security

- ⚠️ Never commit `.env` files
- ⚠️ Keep Discord bot token secret
- ⚠️ Use strong random API keys (32+ characters)
- ⚠️ Rotate API keys periodically
- ⚠️ Use HTTPS for `API_URL` in production

## Architecture

```
┌─────────────────┐      API Calls      ┌──────────────────┐
│                 │◄────────────────────►│                  │
│  Discord Bot    │   (Authenticated)    │  Next.js App     │
│  (This Server)  │                      │  (Vercel)        │
│                 │                      │                  │
└────────┬────────┘                      └────────┬─────────┘
         │                                        │
         │ Discord API                            │
         ▼                                        ▼
   ┌──────────┐                          ┌───────────────┐
   │ Discord  │                          │  PostgreSQL   │
   │ Servers  │                          │  (Neon)       │
   └──────────┘                          └───────────────┘
```

## API Endpoints Used

The bot communicates with these endpoints:

1. **GET** `/api/bot/tickets-needing-reminders`
   - Fetches tickets needing reminders
   - Requires `X-API-Key` header

2. **POST** `/api/bot/update-reminder-sent`
   - Updates ticket after sending reminder
   - Requires `X-API-Key` header
   - Body: `{ ticketId, messageId }`

3. **POST** `/api/bot/acknowledge-delivery`
   - Marks ticket as acknowledged
   - Requires `X-API-Key` header
   - Body: `{ ticketId, discordUserId }`

## Customization

### Change Schedule

Edit the cron expression in `index.js`:

```javascript
// Run at 9 AM UTC
cron.schedule('0 9 * * *', ...)

// Examples:
// Every 6 hours: '0 */6 * * *'
// Twice daily (9 AM & 6 PM UTC): '0 9,18 * * *'
// Every day at 2 PM UTC: '0 14 * * *'
```

### Modify Message Appearance

Edit the `sendDeliveryReminder` function in `index.js` to customize:
- Embed colors
- Message text
- Fields shown
- Button text

### Add More Features

The bot can be extended with:
- Multiple button options
- Snooze functionality
- Different reminder frequencies
- Custom messages per user

## Support

If you encounter issues:

1. Check bot console logs for errors
2. Verify all environment variables are set correctly
3. Test API endpoints manually with curl
4. Ensure Discord bot has correct permissions
5. Check main app logs in Vercel dashboard

## License

MIT
