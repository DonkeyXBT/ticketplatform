import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardClient from "@/components/DashboardClient"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      sales: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Add computed fields for each ticket
  const ticketsWithComputed = tickets.map((ticket) => {
    const totalSold = ticket.sales.reduce((sum, sale) => sum + sale.quantitySold, 0)
    const remainingQuantity = ticket.quantity - totalSold

    return {
      ...ticket,
      totalSold,
      remainingQuantity,
    }
  })

  return <DashboardClient tickets={ticketsWithComputed} user={session.user} />
}
