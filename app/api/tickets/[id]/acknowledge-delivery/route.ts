import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { discordUserId } = body

    if (!discordUserId) {
      return NextResponse.json(
        { error: "Discord user ID is required" },
        { status: 400 }
      )
    }

    // Find the ticket and verify it belongs to the Discord user
    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
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
      where: { id },
      data: {
        deliveryReminderAcknowledged: true,
      },
    })

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
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
