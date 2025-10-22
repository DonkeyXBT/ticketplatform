import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import cron from 'node-cron'
import dotenv from 'dotenv'

dotenv.config()

// Configuration
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const API_URL = process.env.API_URL || 'http://localhost:3000'
const API_KEY = process.env.API_KEY

if (!DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is not set')
  process.exit(1)
}

if (!API_KEY) {
  console.error('❌ API_KEY is not set')
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
client.once('ready', () => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`)
  console.log(`🌐 Connected to ${client.guilds.cache.size} servers`)
  console.log(`🔗 API URL: ${API_URL}`)
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

      // Call API to update ticket
      const response = await fetch(`${API_URL}/api/bot/acknowledge-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify({
          ticketId,
          discordUserId: interaction.user.id,
        }),
      })

      if (response.ok) {
        await interaction.update({
          content: '✅ **Marked as Done!** You will no longer receive reminders for this ticket.',
          embeds: [],
          components: [],
        })
        console.log(`✅ Ticket ${ticketId} acknowledged successfully`)
      } else {
        const error = await response.text()
        console.error(`❌ Failed to acknowledge ticket: ${error}`)
        await interaction.reply({
          content: '❌ Failed to update ticket. Please try again or contact support.',
          ephemeral: true,
        })
      }
    } catch (error) {
      console.error('Error handling button interaction:', error)
      await interaction.reply({
        content: '❌ An error occurred. Please try again later.',
        ephemeral: true,
      })
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
    // Fetch tickets needing reminders from API
    const response = await fetch(`${API_URL}/api/bot/tickets-needing-reminders`, {
      headers: {
        'X-API-Key': API_KEY,
      },
    })

    if (!response.ok) {
      console.error(`❌ Failed to fetch tickets: ${response.status} ${response.statusText}`)
      return
    }

    const { tickets } = await response.json()
    console.log(`📊 Found ${tickets.length} ticket(s) needing reminders`)

    if (tickets.length === 0) {
      console.log('✅ No tickets need reminders right now')
      return
    }

    // Send reminders for each ticket
    for (const ticket of tickets) {
      const messageId = await sendDeliveryReminder(ticket)

      if (messageId) {
        // Update ticket with reminder info via API
        await fetch(`${API_URL}/api/bot/update-reminder-sent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
          },
          body: JSON.stringify({
            ticketId: ticket.id,
            messageId,
          }),
        })
      }

      // Add delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`✅ Processed ${tickets.length} reminder(s)`)
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
client.once('ready', () => {
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
