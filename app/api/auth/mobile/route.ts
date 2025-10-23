import { NextResponse } from "next/server"

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/auth/mobile/callback`

// Step 1: Initiate Discord OAuth
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  if (action === "login") {
    // Log configuration for debugging
    console.log("=== Discord OAuth Configuration ===")
    console.log("Client ID:", DISCORD_CLIENT_ID ? "✓ Set" : "✗ Missing")
    console.log("Client Secret:", DISCORD_CLIENT_SECRET ? "✓ Set" : "✗ Missing")
    console.log("Redirect URI:", REDIRECT_URI)
    console.log("===================================")

    // Check if Discord credentials are configured
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
      return NextResponse.json(
        {
          error: "Discord OAuth not configured",
          details: "DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET missing"
        },
        { status: 500 }
      )
    }

    // Redirect to Discord OAuth
    const discordAuthUrl = new URL("https://discord.com/api/oauth2/authorize")
    discordAuthUrl.searchParams.set("client_id", DISCORD_CLIENT_ID)
    discordAuthUrl.searchParams.set("redirect_uri", REDIRECT_URI)
    discordAuthUrl.searchParams.set("response_type", "code")
    discordAuthUrl.searchParams.set("scope", "identify email")

    console.log("Redirecting to Discord:", discordAuthUrl.toString())

    return NextResponse.redirect(discordAuthUrl.toString())
  }

  if (action === "debug") {
    // Debug endpoint to check configuration
    return NextResponse.json({
      clientIdSet: !!DISCORD_CLIENT_ID,
      clientSecretSet: !!DISCORD_CLIENT_SECRET,
      redirectUri: REDIRECT_URI,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
