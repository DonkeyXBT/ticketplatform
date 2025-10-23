import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt, decrypt } from "@/lib/encryption"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await req.json()

    // Check if account belongs to user
    const existingAccount = await prisma.platformAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Prepare update data with encryption
    const updateData: any = {
      platform: data.platform,
      email: data.email,
      telephoneNumber: data.telephoneNumber || null,
      notes: data.notes || null,
    }

    if (data.password) {
      updateData.encryptedPassword = encrypt(data.password)
    }

    if (data.twoFA !== undefined) {
      updateData.encryptedTwoFA = data.twoFA ? encrypt(data.twoFA) : null
    }

    const account = await prisma.platformAccount.update({
      where: { id },
      data: updateData,
    })

    // Return decrypted version to client
    return NextResponse.json({
      id: account.id,
      platform: account.platform,
      email: account.email,
      password: data.password || decrypt(account.encryptedPassword),
      twoFA: account.encryptedTwoFA ? decrypt(account.encryptedTwoFA) : null,
      telephoneNumber: account.telephoneNumber,
      notes: account.notes,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    })
  } catch (error) {
    console.error("Error updating platform account:", error)
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params

    // Check if account belongs to user
    const existingAccount = await prisma.platformAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    await prisma.platformAccount.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting platform account:", error)
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
}
