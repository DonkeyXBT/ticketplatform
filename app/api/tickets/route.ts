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

  try {
    const data = await req.json()
    console.log("📝 Creating ticket for user:", userId)

    // Parse fields from iOS (snake_case) or web (camelCase)
    const artist = data.artist || null
    const location = data.location || null
    const eventDate = data.event_date || data.eventDate
    const section = data.section || null
    const row = data.row || null
    const seat = data.seat || null
    const quantity = parseInt(data.quantity) || 1
    const buyInPrice = data.buy_in_price || data.buyInPrice ? parseFloat(data.buy_in_price || data.buyInPrice) : null
    const buyCurrency = data.buy_currency || data.buyCurrency || "USD"
    const boughtFrom = data.bought_from || data.boughtFrom || null
    const orderNumber = data.order_number || data.orderNumber || null
    const emailUsed = data.email_used || data.emailUsed || null
    const status = "Listed"

    const ticket = await prisma.ticket.create({
      data: {
        userId: userId,
        artist,
        location,
        eventDate: eventDate ? new Date(eventDate) : null,
        section,
        row,
        seat,
        quantity,
        buyInPrice,
        buyCurrency,
        platform: boughtFrom,
        status,
        orderNumber,
        email: emailUsed,
      },
      include: {
        sales: true,
      },
    })

    console.log("✅ Created ticket:", ticket.id)

    // Add computed fields
    const ticketWithComputed = {
      ...ticket,
      totalSold: 0,
      remainingQuantity: quantity,
      totalRevenue: 0,
      totalProfit: 0,
    }

    // Convert to snake_case for iOS app
    const ticketSnakeCase = toSnakeCase(ticketWithComputed)

    return NextResponse.json(ticketSnakeCase)
  } catch (error) {
    console.error("❌ Error creating ticket:", error)
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    )
  }
}
