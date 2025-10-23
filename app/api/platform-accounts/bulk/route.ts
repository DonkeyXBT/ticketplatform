import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encryption"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { accounts } = await req.json()

    if (!Array.isArray(accounts) || accounts.length === 0) {
      return NextResponse.json(
        { error: "Invalid accounts data" },
        { status: 400 }
      )
    }

    // Validate and encrypt all accounts
    const accountsToCreate = accounts.map((acc) => {
      if (!acc.platform || !acc.email || !acc.password) {
        throw new Error("Missing required fields: platform, email, password")
      }

      return {
        userId: session.user.id,
        platform: acc.platform,
        email: acc.email,
        encryptedPassword: encrypt(acc.password),
        encryptedTwoFA: acc.twoFA ? encrypt(acc.twoFA) : null,
        telephoneNumber: acc.telephoneNumber || null,
        notes: acc.notes || null,
      }
    })

    // Bulk create all accounts
    const result = await prisma.platformAccount.createMany({
      data: accountsToCreate,
      skipDuplicates: false,
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully created ${result.count} account(s)`,
    })
  } catch (error) {
    console.error("Error bulk creating platform accounts:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create accounts" },
      { status: 500 }
    )
  }
}
