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
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/discord`,
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
        console.log("🔐 [AUTH] Sign in callback triggered")
        console.log("📧 [AUTH] User email:", user.email)
        console.log("🔑 [AUTH] Provider:", account?.provider)

        // Check if required environment variables are set
        if (!discordClientId || !discordClientSecret || discordClientId === "placeholder") {
          console.error("❌ [AUTH] Status: 401 - Discord OAuth credentials not properly configured")
          return false
        }

        if (!databaseUrl || databaseUrl.includes("user:password@host")) {
          console.error("❌ [AUTH] Status: 500 - Database URL not properly configured")
          return false
        }

        console.log("✅ [AUTH] Status: 200 - Sign in successful for user:", user.email)
        console.log("🎯 [AUTH] Redirecting to dashboard...")
        return true
      } catch (error) {
        console.error("❌ [AUTH] Status: 500 - Sign in error:", error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      console.log("🔀 [REDIRECT] Called with url:", url)
      console.log("🔀 [REDIRECT] Base URL:", baseUrl)

      // After successful sign in, ALWAYS redirect to dashboard
      if (url.includes("/api/auth/callback") || url.includes("/api/auth/signin")) {
        console.log("🎯 [REDIRECT] Auth callback/signin - forcing dashboard")
        return `${baseUrl}/dashboard`
      }

      // If trying to go to login page after auth, redirect to dashboard
      if (url.includes("/login")) {
        console.log("🎯 [REDIRECT] Login page detected - redirecting to dashboard")
        return `${baseUrl}/dashboard`
      }

      // If the url is trying to go to setup or error page after successful auth, redirect to dashboard
      if (url.includes("/setup") || url.includes("/api/auth/error")) {
        console.log("🎯 [REDIRECT] Overriding setup/error to dashboard")
        return `${baseUrl}/dashboard`
      }

      // If url starts with baseUrl and it's the dashboard, use it
      if (url.startsWith(baseUrl) && url.includes("/dashboard")) {
        console.log("✅ [REDIRECT] Dashboard URL provided, using it")
        return url
      }

      // For any other baseUrl paths, redirect to dashboard
      if (url.startsWith(baseUrl)) {
        console.log("🎯 [REDIRECT] Other baseUrl path, forcing dashboard")
        return `${baseUrl}/dashboard`
      }

      // If url starts with /, prepend baseUrl
      if (url.startsWith("/") && url !== "/login") {
        const finalUrl = `${baseUrl}${url}`
        console.log("✅ [REDIRECT] Relative path:", finalUrl)
        return finalUrl
      }

      // Default to dashboard for everything else
      console.log("🎯 [REDIRECT] Default fallback to dashboard")
      return `${baseUrl}/dashboard`
    },
    session({ session, user }) {
      console.log("🔄 [SESSION] Session callback for user:", user.email)
      session.user.id = user.id
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
})
