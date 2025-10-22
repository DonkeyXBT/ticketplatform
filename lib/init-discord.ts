let initialized = false

export async function initDiscord() {
  // Only initialize in Node.js runtime, not during build
  if (typeof window !== "undefined" || process.env.NEXT_PHASE === "phase-production-build") {
    return
  }

  if (initialized) {
    console.log("Discord bot already initialized")
    return
  }

  try {
    console.log("Initializing Discord bot...")
    const { initializeDiscordBot, setupButtonHandlers } = await import("./discord-bot")
    const client = await initializeDiscordBot()

    if (client) {
      setupButtonHandlers()
      initialized = true
      console.log("Discord bot initialized and handlers set up")
    } else {
      console.error("Failed to initialize Discord bot")
    }
  } catch (error) {
    console.error("Error initializing Discord:", error)
  }
}

// Auto-initialize if Discord token is available and not during build
if (process.env.DISCORD_BOT_TOKEN && process.env.NEXT_PHASE !== "phase-production-build") {
  initDiscord().catch(console.error)
}
