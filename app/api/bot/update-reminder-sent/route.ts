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
    const { saleId, ticketId, messageId } = body

    // Support both saleId (new) and ticketId (legacy)
    const id = saleId || ticketId
    if (!id) {
      return NextResponse.json(
        { error: "saleId or ticketId is required" },
        { status: 400 }
      )
    }

    // Update sale with reminder info
    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        deliveryReminderSent: true,
        lastReminderSentAt: new Date(),
        discordMessageId: messageId || null,
      },
    })

    return NextResponse.json({
      success: true,
      sale: {
        id: updatedSale.id,
        reminderSent: updatedSale.deliveryReminderSent,
        lastReminderSentAt: updatedSale.lastReminderSentAt,
      },
    })
  } catch (error) {
    console.error("Error updating reminder sent:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
