import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt, decrypt } from "@/lib/encryption"
import { NextResponse } from "next/server"
import { getAuthFromRequest } from "@/lib/jwt"
import { toSnakeCase } from "@/lib/transform"

async function getUserId(request?: Request): Promise<string | null> {
  // Try JWT auth first (for mobile)
  if (request) {
    const jwtUser = await getAuthFromRequest(request)
    if (jwtUser?.userId) {
      return jwtUser.userId
    }
  }

  // Fall back to session auth (for web)
  const session = await auth()
  return session?.user?.id || null
}

export async function GET(request: Request) {
  const userId = await getUserId(request)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const accounts = await prisma.platformAccount.findMany({
      where: {
        userId: userId,
      },
      orderBy: [
        { platform: "asc" },
        { createdAt: "desc" },
      ],
    })

    // Decrypt sensitive data before sending to client
    const decryptedAccounts = accounts.map((account) => ({
      id: account.id,
      platform: account.platform,
      email: account.email,
      password: decrypt(account.encryptedPassword),
      twoFactorSecret: account.encryptedTwoFA ? decrypt(account.encryptedTwoFA) : null,
      phoneNumber: account.telephoneNumber,
      notes: account.notes,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }))

    // Convert to snake_case for iOS app
    const accountsSnakeCase = toSnakeCase(decryptedAccounts)

    return NextResponse.json(accountsSnakeCase)
  } catch (error) {
    console.error("Error fetching platform accounts:", error)
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const userId = await getUserId(req)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()

    // Encrypt sensitive data
    const encryptedPassword = encrypt(data.password)
    const encryptedTwoFA = data.twoFactorSecret ? encrypt(data.twoFactorSecret) : null

    const account = await prisma.platformAccount.create({
      data: {
        userId: userId,
        platform: data.platform,
        email: data.email,
        encryptedPassword,
        encryptedTwoFA,
        telephoneNumber: data.phoneNumber || null,
        notes: data.notes || null,
      },
    })

    // Return decrypted version to client
    const response = {
      id: account.id,
      platform: account.platform,
      email: account.email,
      password: data.password,
      twoFactorSecret: data.twoFactorSecret || null,
      phoneNumber: account.telephoneNumber,
      notes: account.notes,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }

    // Convert to snake_case for iOS app
    const responseSnakeCase = toSnakeCase(response)

    return NextResponse.json(responseSnakeCase)
  } catch (error) {
    console.error("Error creating platform account:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
