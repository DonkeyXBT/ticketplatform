import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"
import { redirect } from "next/navigation"
import { AppLoginClient } from "./client"

export default async function AppLoginPage() {
  const session = await auth()

  // If user is already logged in, generate token and redirect to app
  if (session?.user) {
    try {
      // Verify user exists in database and fetch complete user data
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          discordId: true,
          preferredCurrency: true,
        },
      })

      if (!dbUser) {
        console.error("User not found in database:", session.user.id)
        return <AppLoginClient isLoggedIn={false} />
      }

      console.log("✅ User found in database:", {
        id: dbUser.id,
        email: dbUser.email,
        discordId: dbUser.discordId,
      })

      // Generate JWT token with database user ID
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "")
      const token = await new SignJWT({
        userId: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret)

      const userObject = {
        id: dbUser.id,
        email: dbUser.email ?? null,
        name: dbUser.name ?? null,
        image: dbUser.image ?? null,
        preferredCurrency: dbUser.preferredCurrency ?? "USD",
      }

      console.log("✅ Generated JWT token for user:", dbUser.id)

      // Return client component that will redirect to app
      return (
        <AppLoginClient
          token={token}
          user={userObject}
          isLoggedIn={true}
        />
      )
    } catch (error) {
      console.error("❌ Login error:", error)
      return <AppLoginClient isLoggedIn={false} />
    }
  }

  // User not logged in - show login page
  return <AppLoginClient isLoggedIn={false} />
}
