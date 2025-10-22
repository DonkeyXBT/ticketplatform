# 🗄️ DATABASE SETUP - CRITICAL STEP

## The Problem

Your authentication is failing because **the database tables don't exist yet**. NextAuth needs 4 tables to work:
- `User` - stores user accounts
- `Account` - stores OAuth connections (Discord)
- `Session` - stores authentication sessions
- `VerificationToken` - for NextAuth verification

Without these tables, Discord OAuth completes but the session cannot be saved, causing the redirect loop back to login.

---

## Solution: Initialize Your Neon Database

### Option 1: Quick Setup (Recommended)

Run this single command with your production DATABASE_URL:

```bash
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-XXX.us-east-2.aws.neon.tech/neondb?sslmode=require" npm run db:init
```

This will:
1. Generate Prisma Client
2. Create all 5 tables in your Neon database
3. Verify everything was created successfully

### Option 2: Manual Setup

If you prefer to do it step by step:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Push schema to database (creates tables)
DATABASE_URL="your-production-url" npx prisma db push

# 3. Verify tables were created
DATABASE_URL="your-production-url" npm run db:check
```

---

## Get Your Neon DATABASE_URL

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project
3. Click "Connection Details"
4. Copy the connection string (it should look like):
   ```
   postgresql://neondb_owner:PASSWORD@ep-XXX-XXX.region.aws.neon.tech/neondb?sslmode=require
   ```

---

## After Database Setup

Once the tables are created in Neon, you need to **redeploy to Vercel**:

1. **Go to Vercel Dashboard**
   - Your project → Deployments

2. **Trigger Redeploy**
   - Click on latest deployment
   - Click "..." menu → "Redeploy"
   - Wait for deployment to complete (~2 min)

3. **Test Authentication**
   - Visit https://ticketplatform.vercel.app
   - Click "Sign in with Discord"
   - You should now be redirected to /dashboard ✅

---

## Verify Everything Works

Run this to check if tables exist:

```bash
DATABASE_URL="your-production-url" npm run db:check
```

You should see:
```
✅ User                  - EXISTS (0 records)
✅ Account               - EXISTS (0 records)
✅ Session               - EXISTS (0 records)
✅ VerificationToken     - EXISTS (0 records)
✅ Ticket                - EXISTS (0 records)
```

---

## What Each Table Does

- **User**: Stores your Discord user info (id, name, email, image)
- **Account**: Links your Discord account to your user (OAuth tokens)
- **Session**: Stores your login session (7-day expiration)
- **VerificationToken**: Used by NextAuth for email verification (not used for Discord)
- **Ticket**: Stores all your ticket purchase/sale data

---

## Troubleshooting

### "DATABASE_URL is not set"
Make sure you're passing the DATABASE_URL before the command:
```bash
DATABASE_URL="postgresql://..." npm run db:init
```

### "relation does not exist"
Tables weren't created. Run the init script again.

### "password authentication failed"
Your DATABASE_URL password is incorrect. Get a fresh connection string from Neon.

### "SSL connection error"
Make sure your DATABASE_URL ends with `?sslmode=require`

---

## Important Notes

⚠️ **This does NOT need to be run in Vercel**

The database setup happens locally on your machine, but it creates the tables in your **production Neon database** (the cloud database that Vercel uses).

✅ **Run this once, use everywhere**

Once the tables are created in Neon, both your local development AND Vercel production will use the same database with the same tables.

---

## Next Steps After Setup

1. ✅ Run database initialization (creates tables)
2. ✅ Verify tables exist with check script
3. ✅ Redeploy to Vercel (uses existing tables)
4. ✅ Test login at https://ticketplatform.vercel.app
5. ✅ Should redirect to dashboard successfully!

The authentication will work once the database has these tables. This was the missing piece! 🎯
