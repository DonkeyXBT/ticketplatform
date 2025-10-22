# Neon Database Setup Guide

Complete guide to set up your PostgreSQL database with Neon for the Ticket Platform.

## Step 1: Create a Neon Account

1. Go to **https://console.neon.tech/**
2. Click **"Sign Up"** (you can use GitHub, Google, or email)
3. Complete the sign-up process

## Step 2: Create a New Project

1. Once logged in, click **"Create a project"** or **"New Project"**
2. Configure your project:
   - **Project name**: `ticketplatform` (or any name you prefer)
   - **Region**: Choose the closest region to you or your users
     - `US East (Ohio)` - For North America
     - `Europe (Frankfurt)` - For Europe
     - `Asia Pacific (Singapore)` - For Asia
   - **PostgreSQL version**: Leave default (latest version)
   - **Compute size**: Leave default (free tier is fine)

3. Click **"Create Project"**

## Step 3: Get Your Connection String

After creating the project, you'll see a **"Connection Details"** screen.

### Copy the Connection String

You'll see something like this:
```
postgresql://username:password@ep-xyz-123.region.aws.neon.tech/dbname?sslmode=require
```

**IMPORTANT**:
- ✅ Make sure the connection string includes `?sslmode=require` at the end
- ✅ This is your DATABASE_URL - keep it safe!
- ✅ You can always find it again in Project Settings → Connection Details

### Example Connection String Format:
```
postgresql://alex:AbC123xyz@ep-cool-sound-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Components:
- `alex` - Username
- `AbC123xyz` - Password
- `ep-cool-sound-123456.us-east-2.aws.neon.tech` - Host
- `neondb` - Database name
- `?sslmode=require` - SSL mode (required for Neon)

## Step 4: Update Your .env File

1. Open the `.env` file in your project root
2. Replace the DATABASE_URL with your actual Neon connection string:

```env
# Replace this entire line with your Neon connection string
DATABASE_URL="postgresql://your-username:your-password@your-host.neon.tech/neondb?sslmode=require"
```

### Complete .env Example:
```env
# Your actual Neon database URL
DATABASE_URL="postgresql://alex:AbC123xyz@ep-cool-sound-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# Discord OAuth credentials
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
```

## Step 5: Initialize the Database

Now that you have your DATABASE_URL, run this command to create all tables:

```bash
npx prisma db push
```

This command will:
- ✅ Connect to your Neon database
- ✅ Create the `User` table
- ✅ Create the `Account` table
- ✅ Create the `Session` table
- ✅ Create the `VerificationToken` table
- ✅ Create the `Ticket` table with all 18 fields
- ✅ Set up all relationships and indexes

### Expected Output:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-xxx.region.aws.neon.tech:5432"

🚀  Your database is now in sync with your Prisma schema. Done in XXXms

✔ Generated Prisma Client
```

## Step 6: Verify Database Setup

You can verify your database is set up correctly:

### Option 1: Using Neon Console
1. Go back to https://console.neon.tech/
2. Select your project
3. Click "Tables" in the left sidebar
4. You should see 5 tables:
   - `User`
   - `Account`
   - `Session`
   - `VerificationToken`
   - `Ticket`

### Option 2: Using Prisma Studio (Optional)
```bash
npx prisma studio
```
This opens a visual database browser at http://localhost:5555

## Step 7: For Production (Vercel)

When deploying to Vercel:

1. Go to your Vercel project → Settings → Environment Variables
2. Add `DATABASE_URL` with the SAME Neon connection string
3. **IMPORTANT**: Use the same database for both local and production, or create a separate Neon project for production

### Recommended: Separate Databases

For production, it's recommended to create a SEPARATE Neon project:
1. Create another Neon project named "ticketplatform-production"
2. Get the production connection string
3. Use the production connection string in Vercel
4. Use the development connection string locally

This way, you won't mix test data with production data.

---

## Database Schema Overview

Your Ticket Platform database includes:

### User Table
- Stores user authentication data
- Links to Discord accounts
- Tracks user sessions

### Ticket Table (Main Table)
Stores all ticket information with 18 fields:
- Purchase date, Event date
- Artist, Location
- Section, Row, Seat
- Email, Order number
- Buy-in price, Sale price
- **Auto-calculated profit**
- Sale ID, Platform, Status
- Site sold, Delivery email, Delivery name

### Session & Auth Tables
- Manages user sessions (7-day persistence)
- Stores OAuth tokens
- Handles authentication

---

## Troubleshooting

### "Can't reach database server" Error
- Check your internet connection
- Verify the connection string is correct
- Make sure `?sslmode=require` is at the end
- Check if your Neon project is active (not suspended)

### "Authentication failed" Error
- Double-check your username and password in the connection string
- Make sure there are no extra spaces when copying
- Try copying the connection string again from Neon

### "Database does not exist" Error
- Use the connection string EXACTLY as provided by Neon
- Don't modify the database name
- The database is automatically created by Neon

### Connection String Expired
- Neon connection strings don't expire, but passwords can be reset
- If needed, go to Neon console → Settings → Reset password
- Get the new connection string

---

## Neon Free Tier Limits

✅ **You get for FREE:**
- 0.5 GB storage (plenty for thousands of tickets)
- 10 GB data transfer per month
- Automatic backups
- Unlimited projects (with limits per project)
- Always-on databases

This is more than enough for your ticket platform!

---

## Quick Reference

**Neon Console**: https://console.neon.tech/

**Your Connection String Format**:
```
postgresql://username:password@host.region.aws.neon.tech/dbname?sslmode=require
```

**Setup Command**:
```bash
npx prisma db push
```

**View Database**:
```bash
npx prisma studio
```

---

## Next Steps

After database setup:
1. ✅ Database tables created
2. ✅ Run `npm run dev` to start the app
3. ✅ Sign in with Discord
4. ✅ Start adding tickets!

Your database is ready! 🎉
