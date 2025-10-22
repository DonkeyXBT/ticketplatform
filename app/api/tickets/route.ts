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

  // Calculate profit in the buy currency
  const buyInPrice = parseFloat(data.buyInPrice) || 0
  const salePrice = parseFloat(data.salePrice) || 0

  // Import currency conversion
  const { convertCurrencySync } = await import("@/lib/currency")
  const buyCurrency = data.buyCurrency || "USD"
  const sellCurrency = data.sellCurrency || "USD"

  // Convert sale price to buy currency for profit calculation
  const saleInBuyCurrency = convertCurrencySync(salePrice, sellCurrency, buyCurrency)
  const profit = saleInBuyCurrency - buyInPrice

  const ticket = await prisma.ticket.create({
    data: {
      ...data,
      userId: session.user.id,
      buyInPrice,
      buyCurrency,
      salePrice,
      sellCurrency,
      profit,
      profitCurrency: buyCurrency,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      eventDate: data.eventDate ? new Date(data.eventDate) : null,
    },
  })

  return NextResponse.json(ticket)
}
