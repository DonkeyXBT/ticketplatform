import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { SignJWT } from "jose"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Generate a JWT token for mobile app
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || ""
    )

    const token = await new SignJWT({
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret)

    return NextResponse.json({
      token,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
    })
  } catch (error) {
    console.error("Mobile token error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
