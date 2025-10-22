import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const data = await req.json()

  // Check if ticket belongs to user
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!existingTicket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
  }

  // Calculate profit automatically
  const buyInPrice = data.buyInPrice !== undefined ? parseFloat(data.buyInPrice) : existingTicket.buyInPrice || 0
  const salePrice = data.salePrice !== undefined ? parseFloat(data.salePrice) : existingTicket.salePrice || 0
  const profit = salePrice - buyInPrice

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      ...data,
      buyInPrice,
      salePrice,
      profit,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
    },
  })

  return NextResponse.json(ticket)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Check if ticket belongs to user
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!existingTicket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
  }

  await prisma.ticket.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
