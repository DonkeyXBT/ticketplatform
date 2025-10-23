import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt, decrypt } from "@/lib/encryption"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const accounts = await prisma.platformAccount.findMany({
      where: {
        userId: session.user.id,
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
      twoFA: account.encryptedTwoFA ? decrypt(account.encryptedTwoFA) : null,
      telephoneNumber: account.telephoneNumber,
      notes: account.notes,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }))

    return NextResponse.json(decryptedAccounts)
  } catch (error) {
    console.error("Error fetching platform accounts:", error)
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()

    // Encrypt sensitive data
    const encryptedPassword = encrypt(data.password)
    const encryptedTwoFA = data.twoFA ? encrypt(data.twoFA) : null

    const account = await prisma.platformAccount.create({
      data: {
        userId: session.user.id,
        platform: data.platform,
        email: data.email,
        encryptedPassword,
        encryptedTwoFA,
        telephoneNumber: data.telephoneNumber || null,
        notes: data.notes || null,
      },
    })

    // Return decrypted version to client
    return NextResponse.json({
      id: account.id,
      platform: account.platform,
      email: account.email,
      password: data.password,
      twoFA: data.twoFA || null,
      telephoneNumber: account.telephoneNumber,
      notes: account.notes,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    })
  } catch (error) {
    console.error("Error creating platform account:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
