import { jwtVerify } from "jose"

export async function verifyJWT(token: string) {
  try {
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || ""
    )

    const { payload } = await jwtVerify(token, secret)

    return {
      userId: payload.userId as string,
      email: payload.email as string | null,
      name: payload.name as string | null,
    }
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export async function getAuthFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    console.log("⚠️ No Bearer token in Authorization header")
    return null
  }

  const token = authHeader.substring(7)
  console.log(`🔐 JWT Token received: ${token.substring(0, 20)}...`)

  const result = await verifyJWT(token)
  if (result) {
    console.log(`✅ JWT verified for user: ${result.userId}`)
  } else {
    console.log(`❌ JWT verification failed`)
  }

  return result
}
