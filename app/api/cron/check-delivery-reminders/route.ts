import { prisma } from "@/lib/prisma"
import { sendDeliveryReminder } from "@/lib/discord-bot"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const sevenDaysFromNow = new Date(now)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    // Find all sold tickets with event dates within 7 days that haven't been acknowledged
    const ticketsNeedingReminder = await prisma.ticket.findMany({
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
        user: true,
      },
    })

    console.log(
      `Found ${ticketsNeedingReminder.length} tickets needing delivery reminders`
    )

    const results = []

    for (const ticket of ticketsNeedingReminder) {
      if (!ticket.user.discordId) {
        console.log(
          `Skipping ticket ${ticket.id} - user has no Discord ID linked`
        )
        continue
      }

      try {
        const messageId = await sendDeliveryReminder(
          ticket.user.id,
          ticket.user.discordId,
          {
            id: ticket.id,
            artist: ticket.artist,
            location: ticket.location,
            eventDate: ticket.eventDate,
            section: ticket.section,
            row: ticket.row,
            seat: ticket.seat,
            deliveryName: ticket.deliveryName,
            deliveryEmail: ticket.deliveryEmail,
          }
        )

        if (messageId) {
          // Update ticket with reminder info
          await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
              deliveryReminderSent: true,
              lastReminderSentAt: now,
              discordMessageId: messageId,
            },
          })

          results.push({
            ticketId: ticket.id,
            status: "sent",
            messageId,
          })

          console.log(`Sent reminder for ticket ${ticket.id} to user ${ticket.user.name}`)
        } else {
          results.push({
            ticketId: ticket.id,
            status: "failed",
            error: "Failed to send message",
          })
        }
      } catch (error) {
        console.error(`Error sending reminder for ticket ${ticket.id}:`, error)
        results.push({
          ticketId: ticket.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      checked: ticketsNeedingReminder.length,
      results,
    })
  } catch (error) {
    console.error("Error in delivery reminder cron:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
