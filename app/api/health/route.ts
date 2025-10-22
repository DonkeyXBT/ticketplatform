import { NextResponse } from "next/server"

export async function GET() {
  const checks = {
    database: !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("user:password@host"),
    nextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthSecret: !!process.env.NEXTAUTH_SECRET && !process.env.NEXTAUTH_SECRET.includes("change-this"),
    discordClientId: !!process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_ID !== "",
    discordClientSecret: !!process.env.DISCORD_CLIENT_SECRET && process.env.DISCORD_CLIENT_SECRET !== "",
  }

  const allConfigured = Object.values(checks).every(Boolean)

  return NextResponse.json({
    status: allConfigured ? "ready" : "needs_configuration",
    checks,
    message: allConfigured
      ? "All environment variables are configured!"
      : "Some environment variables need to be configured.",
  })
}
