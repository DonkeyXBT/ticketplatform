import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

// Check if required environment variables are set
const discordClientId = process.env.DISCORD_CLIENT_ID
const discordClientSecret = process.env.DISCORD_CLIENT_SECRET
const databaseUrl = process.env.DATABASE_URL

if (!discordClientId || !discordClientSecret) {
  console.warn(
    "⚠️  Discord OAuth credentials not configured. Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET environment variables."
  )
}

if (!databaseUrl || databaseUrl.includes("user:password@host")) {
  console.warn(
    "⚠️  Database not configured. Please set DATABASE_URL environment variable."
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: discordClientId || "placeholder",
      clientSecret: discordClientSecret || "placeholder",
      authorization: {
        params: {
          scope: "identify email",
        },
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Check if required environment variables are set
        if (!discordClientId || !discordClientSecret || discordClientId === "placeholder") {
          console.error("❌ Discord OAuth credentials not properly configured")
          return false
        }

        if (!databaseUrl || databaseUrl.includes("user:password@host")) {
          console.error("❌ Database URL not properly configured")
          return false
        }

        console.log("✅ Sign in successful for user:", user.email)
        return true
      } catch (error) {
        console.error("❌ Sign in error:", error)
        return false
      }
    },
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/setup",
  },
  debug: process.env.NODE_ENV === "development",
})
