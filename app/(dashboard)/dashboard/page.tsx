import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardClient from "@/components/DashboardClient"

export default async function DashboardPage() {
  try {
    console.log("📊 [DASHBOARD] Page load started")
    const session = await auth()

    if (!session?.user) {
      console.log("⚠️ [DASHBOARD] Status: 401 - No session found, redirecting to login")
      redirect("/login")
    }

    console.log("✅ [DASHBOARD] Status: 200 - Session found for user:", session.user.email)
    console.log("🎫 [DASHBOARD] Fetching tickets for user ID:", session.user.id)

    const tickets = await prisma.ticket.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log("✅ [DASHBOARD] Status: 200 - Found", tickets.length, "tickets")
    console.log("🎨 [DASHBOARD] Rendering dashboard UI")

    return <DashboardClient tickets={tickets} user={session.user} />
  } catch (error) {
    console.error("❌ [DASHBOARD] Status: 500 - Error:", error)
    redirect("/setup")
  }
}
