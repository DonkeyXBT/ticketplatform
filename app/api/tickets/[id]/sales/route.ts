import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

// GET /api/tickets/[id]/sales - Get all sales for a ticket
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params
  const userId = await getUserId(req)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {

    // Verify ticket belongs to user
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { userId: true },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all sales for this ticket
    const sales = await prisma.sale.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
    })

    // Convert to snake_case for iOS app
    const salesSnakeCase = toSnakeCase(sales)

    return NextResponse.json(salesSnakeCase)
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    )
  }
}

// POST /api/tickets/[id]/sales - Create a new sale
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params
  const userId = await getUserId(req)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()

    // Verify ticket belongs to user
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        sales: true,
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Calculate total sold quantity
    const totalSold = ticket.sales.reduce(
      (sum, sale) => sum + sale.quantitySold,
      0
    )

    // Check if enough tickets remain
    const remainingQuantity = ticket.quantity - totalSold
    if (data.quantitySold > remainingQuantity) {
      return NextResponse.json(
        {
          error: `Cannot sell ${data.quantitySold} tickets. Only ${remainingQuantity} remaining.`,
        },
        { status: 400 }
      )
    }

    // Calculate profit for this sale
    const buyPricePerTicket = ticket.buyInPrice
      ? ticket.buyInPrice / ticket.quantity
      : 0
    const salePricePerTicket = data.salePrice
      ? data.salePrice / data.quantitySold
      : 0
    const profit =
      data.quantitySold * (salePricePerTicket - buyPricePerTicket)

    // Create the sale
    const sale = await prisma.sale.create({
      data: {
        ticketId,
        quantitySold: data.quantitySold,
        salePrice: data.salePrice,
        sellCurrency: data.sellCurrency || "USD",
        profit,
        profitCurrency: data.profitCurrency || ticket.buyCurrency || "USD",
        saleId: data.saleId || null,
        siteSold: data.siteSold || null,
        deliveryEmail: data.deliveryEmail || null,
        deliveryName: data.deliveryName || null,
      },
    })

    // Update ticket status if all tickets are sold
    const newTotalSold = totalSold + data.quantitySold
    if (newTotalSold >= ticket.quantity) {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: "Sold" },
      })
    } else if (newTotalSold > 0 && ticket.status === "Listed") {
      // Update to "Pending" if partially sold
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: "Pending" },
      })
    }

    // Convert to snake_case for iOS app
    const saleSnakeCase = toSnakeCase(sale)

    return NextResponse.json(saleSnakeCase)
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    )
  }
}
