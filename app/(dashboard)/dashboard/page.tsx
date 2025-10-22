import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardClient from "@/components/DashboardClient"

export default async function DashboardPage() {
  try {
    const session = await auth()

    if (!session?.user) {
      redirect("/login")
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return <DashboardClient tickets={tickets} user={session.user} />
  } catch (error) {
    console.error("❌ Dashboard error:", error)
    redirect("/setup")
  }
}
