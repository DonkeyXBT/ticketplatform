export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Discord bot on server startup
    const { initDiscord } = await import("./lib/init-discord")
    await initDiscord()
  }
}
