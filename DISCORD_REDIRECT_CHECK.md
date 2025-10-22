# Discord OAuth Redirect URI Check

## Current Error

You're being redirected to Discord correctly, but not coming back to your app. This is a **redirect URI mismatch**.

## What You Need to Check

### 1. Go to Discord Developer Portal

Visit: **https://discord.com/developers/applications**

### 2. Select Your Application

Click on your "Ticket Platform" application

### 3. Go to OAuth2 Settings

Click **"OAuth2"** in the left sidebar

### 4. Check Redirect URIs

Under the **"Redirects"** section, you MUST have EXACTLY this URL:

```
https://ticketplatform.vercel.app/api/auth/callback/discord
```

**IMPORTANT CHECKLIST:**
- ✅ Must be `https` (not `http`)
- ✅ Must be `ticketplatform.vercel.app` (your exact domain)
- ✅ Must be `/api/auth/callback/discord` (exact path)
- ✅ NO trailing slash at the end
- ✅ Must click "Save Changes" after adding

### 5. Current Redirect URIs Should Be

You should have TWO redirect URIs:

```
http://localhost:3000/api/auth/callback/discord
https://ticketplatform.vercel.app/api/auth/callback/discord
```

**Screenshot of what it should look like:**
```
Redirects
  http://localhost:3000/api/auth/callback/discord     [X]
  https://ticketplatform.vercel.app/api/auth/callback/discord     [X]

  [Add Redirect]

  [Save Changes]  ← CLICK THIS!
```

### 6. Common Mistakes

❌ **Wrong:** `https://ticketplatform.vercel.app/` (missing callback path)
❌ **Wrong:** `https://ticketplatform.vercel.app/api/auth/callback/discord/` (trailing slash)
❌ **Wrong:** `http://ticketplatform.vercel.app/api/auth/callback/discord` (http instead of https)
❌ **Wrong:** Different domain name

✅ **Correct:** `https://ticketplatform.vercel.app/api/auth/callback/discord`

### 7. After Fixing

1. Make sure you clicked **"Save Changes"** in Discord
2. Wait 1-2 minutes for changes to propagate
3. Try logging in again at: https://ticketplatform.vercel.app
4. You should now be redirected back after authorizing

---

## How Discord OAuth Works

1. User clicks "Sign in with Discord" on your site
2. User is redirected to Discord authorization page ✅ (This is working)
3. User approves the authorization
4. Discord redirects back to your callback URL ❌ (This is failing)
5. Your app processes the callback
6. User is logged in and redirected to dashboard

**You're stuck at step 4** because the redirect URI doesn't match!

---

## Debugging Steps

### Check Environment Variable in Vercel

1. Go to Vercel → Settings → Environment Variables
2. Find `NEXTAUTH_URL`
3. It should be: `https://ticketplatform.vercel.app`
4. NO trailing slash!

### Check Discord Settings

1. Discord Developer Portal
2. Your application → OAuth2
3. Redirects must include: `https://ticketplatform.vercel.app/api/auth/callback/discord`
4. Click Save Changes

### Test

1. Clear your browser cookies for ticketplatform.vercel.app
2. Try logging in again
3. After authorizing on Discord, you should be redirected back

---

## Still Not Working?

If you still have issues, check:

1. **Copy the exact redirect URI from Vercel logs** (look for NEXTAUTH_URL in logs)
2. **Paste it EXACTLY in Discord** (no typos, no extra characters)
3. **Save Changes in Discord**
4. **Redeploy in Vercel** if you changed NEXTAUTH_URL
5. **Wait 2 minutes** for DNS/cache to clear

---

## Quick Fix Command

The redirect URI should be:
```
https://ticketplatform.vercel.app/api/auth/callback/discord
```

1. Copy this ↑
2. Paste in Discord OAuth2 → Redirects
3. Click Save Changes
4. Try again!
