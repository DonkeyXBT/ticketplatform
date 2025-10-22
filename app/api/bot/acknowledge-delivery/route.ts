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
    const { ticketId, discordUserId } = body

    if (!ticketId || !discordUserId) {
      return NextResponse.json(
        { error: "ticketId and discordUserId are required" },
        { status: 400 }
      )
    }

    // Find the ticket and verify it belongs to the Discord user
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        user: {
          discordId: discordUserId,
        },
      },
      include: {
        user: true,
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found or doesn't belong to this user" },
        { status: 404 }
      )
    }

    // Update ticket to mark delivery as acknowledged
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        deliveryReminderAcknowledged: true,
      },
    })

    return NextResponse.json({
      success: true,
      ticket: {
        id: updatedTicket.id,
        acknowledged: updatedTicket.deliveryReminderAcknowledged,
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
