import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // When user signs in with Discord, save their Discord ID
      if (account?.provider === "discord" && account?.providerAccountId) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { discordId: account.providerAccountId },
          })
          console.log(`✅ Saved Discord ID ${account.providerAccountId} for user ${user.id}`)
        } catch (error) {
          console.error("Failed to save Discord ID:", error)
        }
      }
      return true
    },
    async session({ session, user }) {
      session.user.id = user.id
      // Fetch the latest user data to get Discord ID
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { discordId: true },
      })
      if (dbUser?.discordId) {
        session.user.discordId = dbUser.discordId
      }
      return session
    },
  },
})
