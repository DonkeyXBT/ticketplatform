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
    const { ticketId, messageId } = body

    if (!ticketId) {
      return NextResponse.json(
        { error: "ticketId is required" },
        { status: 400 }
      )
    }

    // Update ticket with reminder info
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        deliveryReminderSent: true,
        lastReminderSentAt: new Date(),
        discordMessageId: messageId || null,
      },
    })

    return NextResponse.json({
      success: true,
      ticket: {
        id: updatedTicket.id,
        reminderSent: updatedTicket.deliveryReminderSent,
        lastReminderSentAt: updatedTicket.lastReminderSentAt,
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
