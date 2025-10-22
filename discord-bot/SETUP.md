# Quick Setup Guide for Discord Bot

Follow these steps to get your bot running:

## Step 1: Navigate to Bot Directory

```bash
cd discord-bot
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs Discord.js, Prisma, node-cron, and other dependencies.

## Step 3: Generate Prisma Client

```bash
npm run prisma:generate
```

Or if that doesn't work:

```bash
npx prisma generate
```

This creates the Prisma Client that connects to your database.

## Step 4: Configure Environment Variables

Create a `.env` file:

```bash
# On Windows (PowerShell)
Copy-Item .env.example .env

# On Mac/Linux
cp .env.example .env
```

Edit `.env` and add your values:

```env
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DATABASE_URL=postgresql://neondb_owner:npg_IrioLvuGnP52@ep-old-star-ag7pe8g1-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

## Step 5: Run the Bot

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

## Expected Output

You should see:

```
🔐 Logging in to Discord...
✅ Discord bot logged in as Tickety Reminder#1626
🌐 Connected to 1 servers
🔗 Database connected
⏰ Cron job scheduled for 9:00 AM UTC daily
🚀 Running initial check...
🔍 Checking for tickets needing delivery reminders...
📊 Found 0 ticket(s) needing reminders
✅ No tickets need reminders right now
```

## Troubleshooting

### Error: @prisma/client did not initialize yet

**Solution:**
```bash
npm run prisma:generate
# or
npx prisma generate
```

### Error: DISCORD_BOT_TOKEN is not set

**Solution:**
Make sure you created the `.env` file and added your Discord bot token.

### Error: DATABASE_URL is not set

**Solution:**
Add the `DATABASE_URL` to your `.env` file.

### Database connection failed

**Solution:**
1. Check your `DATABASE_URL` is correct
2. Make sure your database is accessible from your server
3. Verify SSL mode is set: `?sslmode=require`

## Windows-Specific Notes

If you're on Windows:

1. Make sure you're using **PowerShell** or **Command Prompt**, not Git Bash
2. Use `Copy-Item` instead of `cp` for copying files
3. Path separators are `\` instead of `/`

## Production Deployment

For production, use PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start bot
pm2 start index.js --name ticket-bot

# Save configuration
pm2 save

# Set to start on boot
pm2 startup
```

## Need Help?

Check the full documentation in `README.md` or create an issue on GitHub.
