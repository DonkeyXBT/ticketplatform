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

    // Find all sales for tickets with event dates within 7 days that haven't been acknowledged
    const sales = await prisma.sale.findMany({
      where: {
        ticket: {
          eventDate: {
            gte: now,
            lte: sevenDaysFromNow,
          },
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
        ticket: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                discordId: true,
              },
            },
          },
        },
      },
    })

    // Filter out sales where user doesn't have Discord ID
    const validSales = sales
      .filter((sale) => sale.ticket.user.discordId)
      .map((sale) => ({
        id: sale.id,
        ticketId: sale.ticketId,
        artist: sale.ticket.artist,
        location: sale.ticket.location,
        eventDate: sale.ticket.eventDate,
        section: sale.ticket.section,
        row: sale.ticket.row,
        seat: sale.ticket.seat,
        quantitySold: sale.quantitySold,
        deliveryName: sale.deliveryName,
        deliveryEmail: sale.deliveryEmail,
        discordId: sale.ticket.user.discordId,
        userName: sale.ticket.user.name,
      }))

    return NextResponse.json({
      tickets: validSales,
      count: validSales.length,
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
