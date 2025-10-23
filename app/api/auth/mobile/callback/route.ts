import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/auth/mobile/callback`

interface DiscordUser {
  id: string
  username: string
  email: string
  avatar: string | null
}

interface DiscordTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

// Step 2: Handle Discord OAuth callback
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    // Redirect back to app with error
    const appUrl = `ticketplatform://auth-callback?error=${encodeURIComponent(error)}`
    return NextResponse.redirect(appUrl)
  }

  if (!code) {
    const appUrl = `ticketplatform://auth-callback?error=${encodeURIComponent("No authorization code received")}`
    return NextResponse.redirect(appUrl)
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData: DiscordTokenResponse = await tokenResponse.json()

    // Get user info from Discord
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to get user info from Discord")
    }

    const discordUser: DiscordUser = await userResponse.json()

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email: discordUser.email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: discordUser.email,
          name: discordUser.username,
          image: discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
          discordId: discordUser.id,
          emailVerified: new Date(), // Discord emails are verified
        },
      })
    } else if (!user.discordId) {
      // Update existing user with Discord ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: { discordId: discordUser.id },
      })
    }

    // Generate JWT token for mobile app
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "")

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret)

    // Create user object for the app
    const userObject = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    }

    // Redirect back to iOS app with token and user data
    const appUrl = `ticketplatform://auth-callback?token=${encodeURIComponent(
      token
    )}&user=${encodeURIComponent(JSON.stringify(userObject))}`

    return NextResponse.redirect(appUrl)
  } catch (error) {
    console.error("Mobile OAuth error:", error)
    const appUrl = `ticketplatform://auth-callback?error=${encodeURIComponent(
      error instanceof Error ? error.message : "Authentication failed"
    )}`
    return NextResponse.redirect(appUrl)
  }
}
