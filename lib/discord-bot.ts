import { Client, GatewayIntentBits, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"

let discordClient: Client | null = null

export function getDiscordClient() {
  if (!discordClient) {
    discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
    })

    discordClient.on("ready", () => {
      console.log(`Discord bot logged in as ${discordClient?.user?.tag}`)
    })

    discordClient.on("error", (error) => {
      console.error("Discord client error:", error)
    })
  }

  return discordClient
}

export async function initializeDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN

  if (!token) {
    console.error("DISCORD_BOT_TOKEN is not set in environment variables")
    return null
  }

  try {
    const client = getDiscordClient()

    if (!client.isReady()) {
      await client.login(token)
      console.log("Discord bot initialized successfully")
    }

    return client
  } catch (error) {
    console.error("Failed to initialize Discord bot:", error)
    return null
  }
}

export async function sendDeliveryReminder(
  userId: string,
  discordId: string,
  ticket: {
    id: string
    artist: string | null
    location: string | null
    eventDate: Date | null
    section: string | null
    row: string | null
    seat: string | null
    deliveryName: string | null
    deliveryEmail: string | null
  }
) {
  const client = await initializeDiscordBot()

  if (!client || !client.isReady()) {
    console.error("Discord bot is not ready")
    return null
  }

  try {
    // Get the user's DM channel
    const user = await client.users.fetch(discordId)
    const dmChannel = await user.createDM()

    // Calculate days until event
    const daysUntilEvent = ticket.eventDate
      ? Math.ceil((new Date(ticket.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    // Create embed message
    const embed = new EmbedBuilder()
      .setColor(daysUntilEvent && daysUntilEvent <= 3 ? 0xff0000 : 0xffa500)
      .setTitle("🎫 Ticket Delivery Reminder")
      .setDescription(
        daysUntilEvent && daysUntilEvent <= 3
          ? "⚠️ **URGENT:** Event is in " + daysUntilEvent + " days!"
          : "Don't forget to send the tickets to your buyer!"
      )
      .addFields(
        { name: "🎤 Event", value: ticket.artist || "N/A", inline: true },
        { name: "📍 Location", value: ticket.location || "N/A", inline: true },
        {
          name: "📅 Event Date",
          value: ticket.eventDate
            ? new Date(ticket.eventDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "N/A",
          inline: false,
        },
        {
          name: "💺 Seat Details",
          value:
            `Section: ${ticket.section || "N/A"}\n` +
            `Row: ${ticket.row || "N/A"}\n` +
            `Seat: ${ticket.seat || "N/A"}`,
          inline: true,
        },
        {
          name: "📧 Buyer Info",
          value:
            `Name: ${ticket.deliveryName || "N/A"}\n` +
            `Email: ${ticket.deliveryEmail || "N/A"}`,
          inline: true,
        }
      )
      .setFooter({
        text: "Click 'Done' when you've sent the tickets to stop these reminders",
      })
      .setTimestamp()

    // Create action row with Done button
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_delivery_done_${ticket.id}`)
        .setLabel("✅ Done")
        .setStyle(ButtonStyle.Success)
    )

    // Send the message
    const message = await dmChannel.send({
      embeds: [embed],
      components: [row],
    })

    return message.id
  } catch (error) {
    console.error("Failed to send delivery reminder:", error)
    return null
  }
}

export async function setupButtonHandlers() {
  const client = getDiscordClient()

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return

    // Handle ticket delivery done button
    if (interaction.customId.startsWith("ticket_delivery_done_")) {
      const ticketId = interaction.customId.replace("ticket_delivery_done_", "")

      try {
        // Update ticket in database via API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tickets/${ticketId}/acknowledge-delivery`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              discordUserId: interaction.user.id,
            }),
          }
        )

        if (response.ok) {
          await interaction.update({
            content: "✅ **Marked as Done!** You will no longer receive reminders for this ticket.",
            embeds: [],
            components: [],
          })
        } else {
          await interaction.reply({
            content: "❌ Failed to update ticket. Please try again.",
            ephemeral: true,
          })
        }
      } catch (error) {
        console.error("Error handling button interaction:", error)
        await interaction.reply({
          content: "❌ An error occurred. Please try again later.",
          ephemeral: true,
        })
      }
    }
  })
}
