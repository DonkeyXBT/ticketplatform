# 🎫 Ticket Platform Setup Checklist

Complete these steps IN ORDER to get your app running:

## ❌ STEP 1: Set Up Neon Database

**Status**: ⚠️ NOT DONE - You have a placeholder URL

### What to do:
1. Go to **https://console.neon.tech/**
2. Sign up (use GitHub, Google, or email - it's free!)
3. Click **"Create Project"**
   - Name: `ticketplatform`
   - Region: Choose closest to you
4. Copy the connection string that appears
   - It looks like: `postgresql://username:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require`

5. Open your `.env` file and replace this line:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   ```

   With your ACTUAL Neon connection string:
   ```env
   DATABASE_URL="postgresql://your-actual-connection-string-here"
   ```

📖 **Detailed guide**: See `NEON_DATABASE_SETUP.md`

---

## ❌ STEP 2: Set Up Discord OAuth

**Status**: ⚠️ NOT DONE - Client ID and Secret are empty

### What to do:
1. Go to **https://discord.com/developers/applications**
2. Click **"New Application"**
   - Name: `Ticket Platform`
3. Go to **"OAuth2"** in left sidebar
4. Copy your **Client ID** (there's a copy button)
5. Click **"Reset Secret"** → **"Yes, do it!"** → Copy the secret
6. Scroll down to **"Redirects"** section
7. Click **"Add Redirect"** and add:
   ```
   http://localhost:3000/api/auth/callback/discord
   ```
8. Click **"Add Redirect"** again and add:
   ```
   https://ticketplatform.vercel.app/api/auth/callback/discord
   ```
9. Click **"Save Changes"** at the bottom

10. Open your `.env` file and update these lines:
    ```env
    DISCORD_CLIENT_ID="paste-your-client-id-here"
    DISCORD_CLIENT_SECRET="paste-your-client-secret-here"
    ```

📖 **Detailed guide**: See `DISCORD_SETUP.md`

---

## ❌ STEP 3: Generate NextAuth Secret

**Status**: ⚠️ NOT DONE - You have a placeholder secret

### What to do:
Run this command in your terminal:
```bash
openssl rand -base64 32
```

This will output something like:
```
K7JxQm9n3pR5vL2wT8YuA4zX6cE1fS0dH
```

Copy that output and update your `.env` file:
```env
NEXTAUTH_SECRET="paste-the-generated-secret-here"
```

---

## ❌ STEP 4: Initialize Database Tables

**Status**: ⚠️ WAITING - Complete Steps 1-3 first

### What to do:
After completing Steps 1-3, run:

```bash
./setup-database.sh
```

Or manually:
```bash
npx prisma generate
npx prisma db push
```

This creates 5 tables:
- ✅ User
- ✅ Account
- ✅ Session
- ✅ VerificationToken
- ✅ Ticket (with 18 fields)

---

## ❌ STEP 5: Start the App

**Status**: ⚠️ WAITING - Complete Steps 1-4 first

### What to do:
```bash
npm run dev
```

Then open: **http://localhost:3000**

---

## Your .env File Should Look Like This:

```env
# ✅ Replace with your REAL Neon connection string
DATABASE_URL="postgresql://alex:AbC123@ep-cool-sound-123.us-east-2.aws.neon.tech/neondb?sslmode=require"

# ✅ Keep this for local development
NEXTAUTH_URL="http://localhost:3000"

# ✅ Replace with generated secret from: openssl rand -base64 32
NEXTAUTH_SECRET="K7JxQm9n3pR5vL2wT8YuA4zX6cE1fS0dH"

# ✅ Replace with your Discord application credentials
DISCORD_CLIENT_ID="1234567890123456789"
DISCORD_CLIENT_SECRET="AbCdEfGh1234567890_XyZ"
```

---

## Quick Test After Setup:

1. ✅ `.env` file has real values (no placeholders)
2. ✅ Run `npm run dev`
3. ✅ Open http://localhost:3000
4. ✅ Click "Sign in with Discord"
5. ✅ Authorize on Discord
6. ✅ You should see the dashboard!

---

## Current Error Explanation:

The **500 Server Error** you're seeing happens because:
- ❌ Discord Client ID is empty (`""`)
- ❌ Discord Client Secret is empty (`""`)
- ❌ Database URL is a placeholder
- ❌ NEXTAUTH_SECRET is a placeholder

NextAuth.js can't connect to Discord or your database without real credentials!

---

## Need Help?

- 📖 **Neon Database**: See `NEON_DATABASE_SETUP.md`
- 📖 **Discord OAuth**: See `DISCORD_SETUP.md`
- 📖 **Quick Setup**: See `SETUP.md`
- 📖 **Full Docs**: See `README.md`

---

## Estimated Time:
- Neon setup: 2 minutes
- Discord setup: 3 minutes
- Generate secret: 10 seconds
- Initialize database: 30 seconds
- **Total: ~6 minutes** ⏱️

Let's get your app running! 🚀
