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

  // Calculate profit in the buy currency
  const buyInPrice = data.buyInPrice !== undefined ? parseFloat(data.buyInPrice) : existingTicket.buyInPrice || 0
  const salePrice = data.salePrice !== undefined ? parseFloat(data.salePrice) : existingTicket.salePrice || 0
  const quantity = data.quantity !== undefined ? parseInt(data.quantity) : existingTicket.quantity || 1

  // Import currency conversion
  const { convertCurrencySync } = await import("@/lib/currency")
  const buyCurrency = data.buyCurrency || (existingTicket as any).buyCurrency || "USD"
  const sellCurrency = data.sellCurrency || (existingTicket as any).sellCurrency || "USD"

  // Convert sale price to buy currency for profit calculation
  const saleInBuyCurrency = convertCurrencySync(salePrice, sellCurrency, buyCurrency)
  const profit = saleInBuyCurrency - buyInPrice

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      ...data,
      quantity,
      buyInPrice,
      buyCurrency,
      salePrice,
      sellCurrency,
      profit,
      profitCurrency: buyCurrency,
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
