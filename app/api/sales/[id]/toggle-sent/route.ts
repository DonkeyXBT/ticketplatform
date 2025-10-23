import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/sales/[id]/toggle-sent - Toggle ticketsSent status
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: saleId } = await params
  const session = await auth()
  if (!session?.user) {
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

    if (sale.ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Toggle the ticketsSent status
    const updatedSale = await prisma.sale.update({
      where: { id: saleId },
      data: {
        ticketsSent: !sale.ticketsSent,
      },
    })

    return NextResponse.json({
      success: true,
      ticketsSent: updatedSale.ticketsSent,
    })
  } catch (error) {
    console.error("Error toggling tickets sent status:", error)
    return NextResponse.json(
      { error: "Failed to toggle status" },
      { status: 500 }
    )
  }
}
