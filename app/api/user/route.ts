import { NextRequest, NextResponse } from "next/server"
import { getAuthFromRequest } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"
import { toSnakeCase } from "@/lib/transform"

export async function GET(request: NextRequest) {
  try {
    console.log("📱 GET /api/user - Request received")

    // Get user from JWT token
    const jwtUser = await getAuthFromRequest(request)

    if (!jwtUser?.userId) {
      console.log("❌ GET /api/user - Unauthorized: No JWT user")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log(`🔍 GET /api/user - Fetching user from database: ${jwtUser.userId}`)

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: jwtUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        discordId: true,
        preferredCurrency: true,
      },
    })

    if (!user) {
      console.log(`❌ GET /api/user - User not found in database: ${jwtUser.userId}`)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    console.log(`✅ GET /api/user - Successfully fetched user data:`, {
      id: user.id,
      email: user.email,
      name: user.name,
      discordId: user.discordId
    })

    // Convert to snake_case for iOS app
    const userSnakeCase = toSnakeCase(user)
    console.log(`📤 Returning user data in snake_case format`)

    return NextResponse.json(userSnakeCase)
  } catch (error) {
    console.error("❌ Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
