import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(tickets)
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await req.json()

  // Calculate profit automatically
  const buyInPrice = parseFloat(data.buyInPrice) || 0
  const salePrice = parseFloat(data.salePrice) || 0
  const profit = salePrice - buyInPrice

  const ticket = await prisma.ticket.create({
    data: {
      ...data,
      userId: session.user.id,
      buyInPrice,
      salePrice,
      profit,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      eventDate: data.eventDate ? new Date(data.eventDate) : null,
    },
  })

  return NextResponse.json(ticket)
}
