import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

// Check if required environment variables are set
const discordClientId = process.env.DISCORD_CLIENT_ID
const discordClientSecret = process.env.DISCORD_CLIENT_SECRET

if (!discordClientId || !discordClientSecret) {
  console.warn(
    "⚠️  Discord OAuth credentials not configured. Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET environment variables."
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
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
