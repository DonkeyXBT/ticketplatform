import { auth } from "@/lib/auth"
import { SignJWT } from "jose"
import { redirect } from "next/navigation"
import { AppLoginClient } from "./client"

export default async function AppLoginPage() {
  const session = await auth()

  // If user is already logged in, generate token and redirect to app
  if (session?.user) {
    try {
      // Generate JWT token
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "")
      const token = await new SignJWT({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret)

      const userObject = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      }

      // Return client component that will redirect to app
      return (
        <AppLoginClient
          token={token}
          user={userObject}
          isLoggedIn={true}
        />
      )
    } catch (error) {
      console.error("Token generation failed:", error)
    }
  }

  // User not logged in - show login page
  return <AppLoginClient isLoggedIn={false} />
}
