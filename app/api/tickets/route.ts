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

  return NextResponse.json(ticketsWithComputed)
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
  const quantity = parseInt(data.quantity) || 1

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
      quantity,
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
