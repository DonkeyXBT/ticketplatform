# Discord OAuth Setup Guide

Follow these exact steps to set up Discord authentication for your Ticket Platform.

## Step 1: Go to Discord Developer Portal

Open this URL: **https://discord.com/developers/applications**

## Step 2: Create a New Application

1. Click the blue **"New Application"** button (top right)
2. Enter a name: **"Ticket Platform"** (or any name you prefer)
3. Check the box to agree to Discord's Developer Terms
4. Click **"Create"**

## Step 3: Configure OAuth2 Settings

1. In the left sidebar, click **"OAuth2"**
2. You'll see your **Client ID** and **Client Secret** here

### Copy Your Credentials

- **Client ID**: Click "Copy" button next to it
- **Client Secret**: Click "Reset Secret" → Click "Yes, do it!" → Click "Copy"

**IMPORTANT**: Save these somewhere safe! You'll need them for your `.env` file.

## Step 4: Add Redirect URLs

Still on the OAuth2 page, scroll down to **"Redirects"** section:

### For Local Development:
Click **"Add Redirect"** and enter **EXACTLY**:
```
http://localhost:3000/api/auth/callback/discord
```

### For Production (Vercel):
Click **"Add Another"** and enter **EXACTLY**:
```
https://ticketplatform.vercel.app/api/auth/callback/discord
```

**IMPORTANT**: Make sure there are NO trailing slashes!

**Your redirects should now show:**
- ✅ `http://localhost:3000/api/auth/callback/discord`
- ✅ `https://ticketplatform.vercel.app/api/auth/callback/discord`

## Step 4b: Configure OAuth2 Scopes

Still on the OAuth2 page, scroll down to **"Default Authorization Link"** section:

Under **"Scopes"**, make sure these are selected:
- ✅ **identify** - To get user ID and username
- ✅ **email** - To get user's email address

These scopes are already configured in the app, you just need to verify they're available.

Click **"Save Changes"** at the bottom!

## Step 5: Update Your Environment Variables

### For Local Development (.env file):

```env
DISCORD_CLIENT_ID="paste-your-client-id-here"
DISCORD_CLIENT_SECRET="paste-your-client-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### For Production (Vercel Dashboard):

Go to your Vercel project → Settings → Environment Variables

Add these variables:
```
DISCORD_CLIENT_ID = paste-your-client-id-here
DISCORD_CLIENT_SECRET = paste-your-client-secret-here
NEXTAUTH_URL = https://ticketplatform.vercel.app
```

## Step 6: Test It!

### Local Testing:
1. Run `npm run dev`
2. Go to http://localhost:3000
3. Click "Sign in with Discord"
4. You should be redirected to Discord to authorize

### Production Testing:
1. Deploy to Vercel (or redeploy if already deployed)
2. Go to https://ticketplatform.vercel.app
3. Click "Sign in with Discord"
4. Authorize and you're in!

### Session Persistence
Your session will stay logged in for **7 days** without needing to sign in again. The app automatically:
- ✅ Keeps you logged in for 7 days
- ✅ Stores session securely in the database
- ✅ Uses both `identify` and `email` scopes from Discord
- ✅ Automatically refreshes your session when active

---

## Troubleshooting

### "Invalid Redirect URI" Error
- Make sure you added BOTH redirect URLs in Discord
- Check for typos (it must be exact!)
- Make sure you clicked "Save Changes" in Discord

### "Invalid Client" Error
- Double-check your Client ID and Secret
- Make sure there are no extra spaces when copying
- Try resetting the Client Secret and copying it again

### Still Not Working?
1. Clear your browser cookies
2. Try in an incognito/private window
3. Check that your NEXTAUTH_URL matches your domain exactly

---

## Quick Reference

**Discord Developer Portal**: https://discord.com/developers/applications

**Local Redirect**: `http://localhost:3000/api/auth/callback/discord`

**Production Redirect**: `https://ticketplatform.vercel.app/api/auth/callback/discord`

**Your Application URL**: https://ticketplatform.vercel.app

---

That's it! Your Discord OAuth should now be fully configured. 🎉
