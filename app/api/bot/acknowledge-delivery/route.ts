import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Verify API key
    const apiKey = req.headers.get("x-api-key")
    if (!apiKey || apiKey !== process.env.BOT_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { saleId, ticketId, discordUserId } = body

    // Support both saleId (new) and ticketId (legacy)
    const id = saleId || ticketId
    if (!id || !discordUserId) {
      return NextResponse.json(
        { error: "saleId/ticketId and discordUserId are required" },
        { status: 400 }
      )
    }

    // Find the sale and verify it belongs to the Discord user
    const sale = await prisma.sale.findFirst({
      where: {
        id,
        ticket: {
          user: {
            discordId: discordUserId,
          },
        },
      },
      include: {
        ticket: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!sale) {
      return NextResponse.json(
        { error: "Sale not found or doesn't belong to this user" },
        { status: 404 }
      )
    }

    // Update sale to mark delivery as acknowledged
    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        deliveryReminderAcknowledged: true,
      },
    })

    return NextResponse.json({
      success: true,
      sale: {
        id: updatedSale.id,
        acknowledged: updatedSale.deliveryReminderAcknowledged,
      },
    })
  } catch (error) {
    console.error("Error acknowledging delivery:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
