import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getAuthFromRequest } from "@/lib/jwt"
import { toSnakeCase } from "@/lib/transform"

async function getUserId(request?: Request): Promise<string | null> {
  // Try JWT auth first (for mobile)
  if (request) {
    const jwtUser = await getAuthFromRequest(request)
    if (jwtUser?.userId) {
      return jwtUser.userId
    }
  }

  // Fall back to session auth (for web)
  const session = await auth()
  return session?.user?.id || null
}

export async function GET(request: Request) {
  console.log("📱 GET /api/tickets - Request received")

  const userId = await getUserId(request)

  if (!userId) {
    console.log("❌ GET /api/tickets - Unauthorized: No user ID")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log(`🔍 GET /api/tickets - Fetching tickets for user: ${userId}`)

  const tickets = await prisma.ticket.findMany({
    where: {
      userId: userId,
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

  console.log(`📦 GET /api/tickets - Found ${tickets.length} tickets in database for user ${userId}`)

  // Add computed fields for each ticket
  const ticketsWithComputed = tickets.map((ticket) => {
    const totalSold = ticket.sales.reduce((sum, sale) => sum + sale.quantitySold, 0)
    const remainingQuantity = ticket.quantity - totalSold

    // Calculate total revenue (sum of all sale prices)
    const totalRevenue = ticket.sales.reduce((sum, sale) => {
      return sum + (sale.salePrice ? sale.salePrice * sale.quantitySold : 0)
    }, 0)

    // Calculate total profit (sum of all sale profits)
    const totalProfit = ticket.sales.reduce((sum, sale) => {
      return sum + (sale.profit || 0)
    }, 0)

    console.log(`📊 Ticket ${ticket.id}: ${totalSold}/${ticket.quantity} sold, Revenue: ${totalRevenue}, Profit: ${totalProfit}`)

    return {
      ...ticket,
      totalSold,
      remainingQuantity,
      totalRevenue,
      totalProfit,
    }
  })

  // Convert to snake_case for iOS app
  const ticketsSnakeCase = toSnakeCase(ticketsWithComputed)

  console.log(`✅ Returning ${ticketsWithComputed.length} tickets from database for user ${userId}`)
  console.log(`📤 Returning data in snake_case format`)

  return NextResponse.json(ticketsSnakeCase)
}

export async function POST(req: Request) {
  const userId = await getUserId(req)

  if (!userId) {
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
      userId: userId,
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
