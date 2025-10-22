# Vercel Deployment Setup Guide

Your app is deployed to: **https://ticketplatform.vercel.app**

But you're getting a 500 error because environment variables aren't configured yet!

## Step 1: Go to Vercel Dashboard

1. Go to **https://vercel.com**
2. Log in to your account
3. Find your **ticketplatform** project
4. Click on it

## Step 2: Go to Settings

1. Click **"Settings"** tab at the top
2. Click **"Environment Variables"** in the left sidebar

## Step 3: Add Environment Variables

You need to add 5 environment variables. Click **"Add New"** for each:

### Variable 1: DATABASE_URL

**Name**: `DATABASE_URL`

**Value**: Your Neon connection string
```
postgresql://username:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require
```

**Environments**: Check all three: ✅ Production ✅ Preview ✅ Development

---

### Variable 2: NEXTAUTH_URL

**Name**: `NEXTAUTH_URL`

**Value**:
```
https://ticketplatform.vercel.app
```

⚠️ **IMPORTANT**: No trailing slash!

**Environments**: ✅ Production only (uncheck Preview and Development)

---

### Variable 3: NEXTAUTH_SECRET

**Name**: `NEXTAUTH_SECRET`

**Value**: Generate a secret:
```bash
openssl rand -base64 32
```

Then paste the output (something like `K7JxQm9n3pR5vL2wT8YuA4zX6cE1fS0dH`)

**Environments**: Check all three: ✅ Production ✅ Preview ✅ Development

---

### Variable 4: DISCORD_CLIENT_ID

**Name**: `DISCORD_CLIENT_ID`

**Value**: Your Discord Client ID from https://discord.com/developers/applications

Example: `1234567890123456789`

**Environments**: Check all three: ✅ Production ✅ Preview ✅ Development

---

### Variable 5: DISCORD_CLIENT_SECRET

**Name**: `DISCORD_CLIENT_SECRET`

**Value**: Your Discord Client Secret from https://discord.com/developers/applications

Example: `AbCdEfGh1234567890_XyZ`

**Environments**: Check all three: ✅ Production ✅ Preview ✅ Development

---

## Step 4: Redeploy

After adding all environment variables:

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** (three dots) menu
4. Click **"Redeploy"**
5. Check **"Use existing Build Cache"** (faster)
6. Click **"Redeploy"**

Wait ~1-2 minutes for deployment to complete.

---

## Step 5: Verify Discord OAuth Redirects

Make sure you added the production redirect in Discord:

1. Go to **https://discord.com/developers/applications**
2. Select your application
3. Go to **"OAuth2"**
4. Under **"Redirects"**, verify you have:
   ```
   https://ticketplatform.vercel.app/api/auth/callback/discord
   ```
5. If not, add it and click **"Save Changes"**

---

## Step 6: Check Configuration Status

After redeployment, check if everything is configured:

1. Go to **https://ticketplatform.vercel.app/setup**
2. You should see all items marked as "Configured" ✅
3. If any items show "Missing" ❌, review your environment variables

## Step 7: Test Your Production App

1. Go to **https://ticketplatform.vercel.app**
2. Click **"Sign in with Discord"**
3. Authorize the app
4. You should see your dashboard! 🎉

💡 **Tip**: If you get redirected to the setup page, it means some environment variables aren't configured yet. The setup page will show you exactly which ones are missing!

---

## Troubleshooting Production Issues

### Still getting 500 error?
1. Check all 5 environment variables are set in Vercel
2. Make sure there are no extra spaces in the values
3. Verify DATABASE_URL has `?sslmode=require` at the end
4. Check NEXTAUTH_URL has NO trailing slash
5. Redeploy after making changes

### "Invalid Redirect URI" error?
- Make sure Discord has the production redirect URL
- URL must be EXACT: `https://ticketplatform.vercel.app/api/auth/callback/discord`
- No trailing slashes!
- Click "Save Changes" in Discord Developer Portal

### Database connection error?
- Verify your Neon database is active
- Check DATABASE_URL is correct
- Make sure you ran `npx prisma db push` to create tables

### Check Vercel Logs
1. Go to your Vercel project
2. Click "Deployments"
3. Click on the latest deployment
4. Check the "Function Logs" for errors

---

## Environment Variables Summary

Here's what your Vercel environment variables should look like:

| Variable | Value | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://ticketplatform.vercel.app` | Production only |
| `NEXTAUTH_SECRET` | `your-generated-secret` | Production, Preview, Development |
| `DISCORD_CLIENT_ID` | `your-client-id` | Production, Preview, Development |
| `DISCORD_CLIENT_SECRET` | `your-client-secret` | Production, Preview, Development |

---

## Local vs Production

**Local Development** (.env file):
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
DISCORD_CLIENT_ID="your-id"
DISCORD_CLIENT_SECRET="your-secret"
```

**Production** (Vercel):
```env
DATABASE_URL="postgresql://..."  (same or different Neon DB)
NEXTAUTH_URL="https://ticketplatform.vercel.app"
NEXTAUTH_SECRET="your-secret"  (can be the same)
DISCORD_CLIENT_ID="your-id"  (same)
DISCORD_CLIENT_SECRET="your-secret"  (same)
```

---

## Optional: Separate Production Database

For production, you might want a separate database:

1. Create a new Neon project: "ticketplatform-production"
2. Copy the new connection string
3. Use that connection string for DATABASE_URL in Vercel
4. Run `npx prisma db push` with production DATABASE_URL

This keeps your test data separate from production!

---

## Need More Help?

- 🔧 **Discord Setup**: See `DISCORD_SETUP.md`
- 🗄️ **Database Setup**: See `NEON_DATABASE_SETUP.md`
- 📋 **Setup Checklist**: See `CHECKLIST.md`

---

Your production app at **https://ticketplatform.vercel.app** will work once you:
1. ✅ Add all 5 environment variables in Vercel
2. ✅ Add production redirect URL in Discord
3. ✅ Redeploy your app

Let's get it live! 🚀
