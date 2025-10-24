import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EventsOverviewClient from "@/components/EventsOverviewClient"

export default async function EventsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      sales: true,
    },
    orderBy: {
      eventDate: "asc",
    },
  })

  return <EventsOverviewClient tickets={tickets} user={session.user} />
}
