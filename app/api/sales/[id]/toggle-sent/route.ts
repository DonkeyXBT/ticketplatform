import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

// POST /api/sales/[id]/toggle-sent - Toggle ticketsSent status
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: saleId } = await params
  const userId = await getUserId(req)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get the sale and verify ownership
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        ticket: {
          select: { userId: true },
        },
      },
    })

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    if (sale.ticket.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Toggle the ticketsSent status
    const updatedSale = await prisma.sale.update({
      where: { id: saleId },
      data: {
        ticketsSent: !sale.ticketsSent,
      },
    })

    const response = {
      success: true,
      ticketsSent: updatedSale.ticketsSent,
    }

    // Convert to snake_case for iOS app
    const responseSnakeCase = toSnakeCase(response)

    return NextResponse.json(responseSnakeCase)
  } catch (error) {
    console.error("Error toggling tickets sent status:", error)
    return NextResponse.json(
      { error: "Failed to toggle status" },
      { status: 500 }
    )
  }
}
