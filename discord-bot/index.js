import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import cron from 'node-cron'
import dotenv from 'dotenv'
import { prisma } from './db.js'

dotenv.config()

// Configuration
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

if (!DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is not set')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set')
  process.exit(1)
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
})

// Bot ready event
client.once('clientReady', () => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`)
  console.log(`🌐 Connected to ${client.guilds.cache.size} servers`)
  console.log(`🔗 Database connected`)
  console.log(`⏰ Cron job scheduled for 9:00 AM UTC daily`)
})

// Handle button interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return

  // Handle ticket delivery done button
  if (interaction.customId.startsWith('ticket_delivery_done_')) {
    const ticketId = interaction.customId.replace('ticket_delivery_done_', '')

    try {
      console.log(`📝 User ${interaction.user.tag} acknowledged delivery for ticket ${ticketId}`)

      // Find the ticket and verify it belongs to the Discord user
      const ticket = await prisma.ticket.findFirst({
        where: {
          id: ticketId,
          user: {
            discordId: interaction.user.id,
          },
        },
      })

      if (!ticket) {
        await interaction.reply({
          content: '❌ Ticket not found or doesn\'t belong to you.',
          ephemeral: true,
        })
        return
      }

      // Update ticket to mark delivery as acknowledged
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          deliveryReminderAcknowledged: true,
        },
      })

      await interaction.update({
        content: '✅ **Marked as Done!** You will no longer receive reminders for this ticket.',
        embeds: [],
        components: [],
      })
      console.log(`✅ Ticket ${ticketId} acknowledged successfully`)
    } catch (error) {
      console.error('Error handling button interaction:', error)
      await interaction.reply({
        content: '❌ An error occurred. Please try again later.',
        ephemeral: true,
      }).catch(() => {})
    }
  }
})

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error)
})

// Function to send delivery reminder
async function sendDeliveryReminder(ticket) {
  try {
    const user = await client.users.fetch(ticket.discordId)
    const dmChannel = await user.createDM()

    // Calculate days until event
    const daysUntilEvent = ticket.eventDate
      ? Math.ceil((new Date(ticket.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    // Create embed message
    const embed = new EmbedBuilder()
      .setColor(daysUntilEvent && daysUntilEvent <= 3 ? 0xff0000 : 0xffa500)
      .setTitle('🎫 Ticket Delivery Reminder')
      .setDescription(
        daysUntilEvent && daysUntilEvent <= 3
          ? `⚠️ **URGENT:** Event is in ${daysUntilEvent} day${daysUntilEvent === 1 ? '' : 's'}!`
          : "Don't forget to send the tickets to your buyer!"
      )
      .addFields(
        { name: '🎤 Event', value: ticket.artist || 'N/A', inline: true },
        { name: '📍 Location', value: ticket.location || 'N/A', inline: true },
        {
          name: '📅 Event Date',
          value: ticket.eventDate
            ? new Date(ticket.eventDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'N/A',
          inline: false,
        },
        {
          name: '💺 Seat Details',
          value:
            `Section: ${ticket.section || 'N/A'}\n` +
            `Row: ${ticket.row || 'N/A'}\n` +
            `Seat: ${ticket.seat || 'N/A'}`,
          inline: true,
        },
        {
          name: '📧 Buyer Info',
          value:
            `Name: ${ticket.deliveryName || 'N/A'}\n` +
            `Email: ${ticket.deliveryEmail || 'N/A'}`,
          inline: true,
        }
      )
      .setFooter({
        text: "Click 'Done' when you've sent the tickets to stop these reminders",
      })
      .setTimestamp()

    // Create action row with Done button
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_delivery_done_${ticket.id}`)
        .setLabel('✅ Done')
        .setStyle(ButtonStyle.Success)
    )

    // Send the message
    const message = await dmChannel.send({
      embeds: [embed],
      components: [row],
    })

    console.log(`📨 Sent reminder for ticket ${ticket.id} to user ${user.tag}`)
    return message.id
  } catch (error) {
    console.error(`Failed to send reminder for ticket ${ticket.id}:`, error)
    return null
  }
}

// Function to check and send reminders
async function checkDeliveryReminders() {
  console.log('🔍 Checking for tickets needing delivery reminders...')

  try {
    const now = new Date()
    const sevenDaysFromNow = new Date(now)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    // Find all sold tickets with event dates within 7 days that haven't been acknowledged
    const tickets = await prisma.ticket.findMany({
      where: {
        status: 'Sold',
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
    const validTickets = tickets.filter((ticket) => ticket.user.discordId)

    console.log(`📊 Found ${validTickets.length} ticket(s) needing reminders`)

    if (validTickets.length === 0) {
      console.log('✅ No tickets need reminders right now')
      return
    }

    // Send reminders for each ticket
    for (const ticket of validTickets) {
      const messageId = await sendDeliveryReminder({
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
      })

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
      }

      // Add delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`✅ Processed ${validTickets.length} reminder(s)`)
  } catch (error) {
    console.error('Error checking delivery reminders:', error)
  }
}

// Schedule cron job to run daily at 9 AM UTC
cron.schedule('0 9 * * *', () => {
  console.log('⏰ Running scheduled delivery reminder check...')
  checkDeliveryReminders()
})

// Also check immediately on startup (for testing)
client.once('clientReady', () => {
  console.log('🚀 Running initial check...')
  checkDeliveryReminders()
})

// Login to Discord
client.login(DISCORD_BOT_TOKEN)
  .then(() => {
    console.log('🔐 Logging in to Discord...')
  })
  .catch((error) => {
    console.error('❌ Failed to login to Discord:', error)
    process.exit(1)
  })

// Handle process termination
process.on('SIGINT', () => {
  console.log('👋 Shutting down bot...')
  client.destroy()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('👋 Shutting down bot...')
  client.destroy()
  process.exit(0)
})
