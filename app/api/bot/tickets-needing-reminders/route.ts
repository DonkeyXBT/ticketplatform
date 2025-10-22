import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    // Verify API key
    const apiKey = req.headers.get("x-api-key")
    if (!apiKey || apiKey !== process.env.BOT_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const sevenDaysFromNow = new Date(now)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    // Find all sold tickets with event dates within 7 days that haven't been acknowledged
    const tickets = await prisma.ticket.findMany({
      where: {
        status: "Sold",
        eventDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
        deliveryReminderAcknowledged: false,
        OR: [
          // Never sent a reminder
          { deliveryReminderSent: false },
          // Or last reminder was sent more than 24 hours ago
          {
            lastReminderSentAt: {
              lte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            discordId: true,
          },
        },
      },
    })

    // Filter out tickets where user doesn't have Discord ID
    const validTickets = tickets
      .filter((ticket) => ticket.user.discordId)
      .map((ticket) => ({
        id: ticket.id,
        artist: ticket.artist,
        location: ticket.location,
        eventDate: ticket.eventDate,
        section: ticket.section,
        row: ticket.row,
        seat: ticket.seat,
        deliveryName: ticket.deliveryName,
        deliveryEmail: ticket.deliveryEmail,
        discordId: ticket.user.discordId,
        userName: ticket.user.name,
      }))

    return NextResponse.json({
      tickets: validTickets,
      count: validTickets.length,
    })
  } catch (error) {
    console.error("Error fetching tickets needing reminders:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
