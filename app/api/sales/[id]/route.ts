import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/sales/[id] - Update a sale
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: saleId } = await params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()

    // Get the sale and verify ownership
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        ticket: {
          include: {
            sales: true,
          },
        },
      },
    })

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    if (sale.ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // If quantity is being changed, check availability
    if (data.quantitySold && data.quantitySold !== sale.quantitySold) {
      const totalSoldExcludingThis = sale.ticket.sales
        .filter((s) => s.id !== saleId)
        .reduce((sum, s) => sum + s.quantitySold, 0)

      const remainingQuantity =
        sale.ticket.quantity - totalSoldExcludingThis

      if (data.quantitySold > remainingQuantity) {
        return NextResponse.json(
          {
            error: `Cannot sell ${data.quantitySold} tickets. Only ${remainingQuantity} available.`,
          },
          { status: 400 }
        )
      }
    }

    // Recalculate profit if price or quantity changes
    let profit = sale.profit
    if (data.quantitySold || data.salePrice) {
      const quantity = data.quantitySold || sale.quantitySold
      const salePrice = data.salePrice !== undefined ? data.salePrice : sale.salePrice
      const buyPricePerTicket = sale.ticket.buyInPrice
        ? sale.ticket.buyInPrice / sale.ticket.quantity
        : 0
      const salePricePerTicket = salePrice ? salePrice / quantity : 0
      profit = quantity * (salePricePerTicket - buyPricePerTicket)
    }

    // Update the sale
    const updatedSale = await prisma.sale.update({
      where: { id: saleId },
      data: {
        quantitySold: data.quantitySold,
        salePrice: data.salePrice,
        sellCurrency: data.sellCurrency,
        profit,
        profitCurrency: data.profitCurrency,
        saleId: data.saleId,
        siteSold: data.siteSold,
        deliveryEmail: data.deliveryEmail,
        deliveryName: data.deliveryName,
      },
    })

    // Update ticket status based on total sales
    const totalSold = sale.ticket.sales
      .filter((s) => s.id !== saleId)
      .reduce((sum, s) => sum + s.quantitySold, 0) + (data.quantitySold || sale.quantitySold)

    let status = sale.ticket.status
    if (totalSold >= sale.ticket.quantity) {
      status = "Sold"
    } else if (totalSold > 0) {
      status = "Pending"
    } else {
      status = "Listed"
    }

    await prisma.ticket.update({
      where: { id: sale.ticketId },
      data: { status },
    })

    return NextResponse.json(updatedSale)
  } catch (error) {
    console.error("Error updating sale:", error)
    return NextResponse.json(
      { error: "Failed to update sale" },
      { status: 500 }
    )
  }
}

// DELETE /api/sales/[id] - Delete a sale
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: saleId } = await params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {

    // Get the sale and verify ownership
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        ticket: {
          include: {
            sales: true,
          },
        },
      },
    })

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    if (sale.ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the sale
    await prisma.sale.delete({
      where: { id: saleId },
    })

    // Update ticket status based on remaining sales
    const totalSold = sale.ticket.sales
      .filter((s) => s.id !== saleId)
      .reduce((sum, s) => sum + s.quantitySold, 0)

    let status = "Listed"
    if (totalSold >= sale.ticket.quantity) {
      status = "Sold"
    } else if (totalSold > 0) {
      status = "Pending"
    }

    await prisma.ticket.update({
      where: { id: sale.ticketId },
      data: { status },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting sale:", error)
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    )
  }
}
