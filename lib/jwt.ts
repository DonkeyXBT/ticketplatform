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
    return null
  }

  const token = authHeader.substring(7)
  return await verifyJWT(token)
}
