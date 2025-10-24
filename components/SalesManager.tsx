"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, X, DollarSign, Users, Package, Send, CheckCircle } from "lucide-react"
import { CURRENCIES, convertCurrencySync } from "@/lib/currency"

interface Sale {
  id: string
  quantitySold: number
  salePrice: number | null
  sellCurrency: string
  profit: number | null
  profitCurrency: string
  saleId: string | null
  siteSold: string | null
  deliveryEmail: string | null
  deliveryName: string | null
  ticketsSent: boolean
  createdAt: Date
}

interface Ticket {
  id: string
  quantity: number
  buyInPrice: number | null
  buyCurrency: string | null
  artist: string | null
  location: string | null
}

interface SalesManagerProps {
  ticket: Ticket
  onClose: () => void
}

const SITES = [
  "Stubhub",
  "Viagogo",
  "Ticketmaster",
  "AXS",
  "SeeTickets",
  "Eventim",
  "Dice",
  "Twickets",
  "Other",
]

export default function SalesManager({ ticket, onClose }: SalesManagerProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [isAddingSale, setIsAddingSale] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)

  const [saleForm, setSaleForm] = useState({
    quantitySold: "1",
    salePricePerTicket: "",
    salePrice: "",
    sellCurrency: ticket.buyCurrency || "USD",
    saleId: "",
    siteSold: "Stubhub",
    deliveryEmail: "",
    deliveryName: "",
  })

  useEffect(() => {
    fetchSales()
  }, [ticket.id])

  // Auto-calculate total sale price from per-ticket price × quantity
  useEffect(() => {
    const perTicket = parseFloat(saleForm.salePricePerTicket) || 0
    const qty = parseInt(saleForm.quantitySold) || 1
    const total = perTicket * qty

    setSaleForm((prev) => ({
      ...prev,
      salePrice: total > 0 ? total.toFixed(2) : "",
    }))
  }, [saleForm.salePricePerTicket, saleForm.quantitySold])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/tickets/${ticket.id}/sales`)
      if (res.ok) {
        const data = await res.json()
        setSales(data)
      }
    } catch (error) {
      console.error("Error fetching sales:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalSold = sales.reduce((sum, sale) => sum + (Number(sale.quantitySold) || 0), 0)
  const remainingQuantity = Number(ticket.quantity) - totalSold

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault()

    if (parseInt(saleForm.quantitySold) > remainingQuantity) {
      alert(`Cannot sell ${saleForm.quantitySold} tickets. Only ${remainingQuantity} remaining.`)
      return
    }

    try {
      const res = await fetch(`/api/tickets/${ticket.id}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantitySold: parseInt(saleForm.quantitySold),
          salePrice: parseFloat(saleForm.salePrice),
          sellCurrency: saleForm.sellCurrency,
          profitCurrency: ticket.buyCurrency,
          saleId: saleForm.saleId || null,
          siteSold: saleForm.siteSold || null,
          deliveryEmail: saleForm.deliveryEmail || null,
          deliveryName: saleForm.deliveryName || null,
        }),
      })

      if (res.ok) {
        await fetchSales()
        setIsAddingSale(false)
        resetForm()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to create sale")
      }
    } catch (error) {
      console.error("Error creating sale:", error)
      alert("Failed to create sale")
    }
  }

  const handleUpdateSale = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSale) return

    try {
      const res = await fetch(`/api/sales/${editingSale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantitySold: parseInt(saleForm.quantitySold),
          salePrice: parseFloat(saleForm.salePrice),
          sellCurrency: saleForm.sellCurrency,
          profitCurrency: ticket.buyCurrency,
          saleId: saleForm.saleId || null,
          siteSold: saleForm.siteSold || null,
          deliveryEmail: saleForm.deliveryEmail || null,
          deliveryName: saleForm.deliveryName || null,
        }),
      })

      if (res.ok) {
        await fetchSales()
        setEditingSale(null)
        resetForm()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to update sale")
      }
    } catch (error) {
      console.error("Error updating sale:", error)
      alert("Failed to update sale")
    }
  }

  const handleDeleteSale = async (saleId: string) => {
    if (!confirm("Are you sure you want to delete this sale?")) return

    try {
      const res = await fetch(`/api/sales/${saleId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await fetchSales()
      }
    } catch (error) {
      console.error("Error deleting sale:", error)
      alert("Failed to delete sale")
    }
  }

  const handleToggleTicketsSent = async (saleId: string) => {
    try {
      const res = await fetch(`/api/sales/${saleId}/toggle-sent`, {
        method: "POST",
      })

      if (res.ok) {
        await fetchSales()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to update status")
      }
    } catch (error) {
      console.error("Error toggling tickets sent:", error)
      alert("Failed to update status")
    }
  }

  const startEdit = (sale: Sale) => {
    setEditingSale(sale)
    const perTicket = sale.salePrice ? sale.salePrice / sale.quantitySold : 0
    setSaleForm({
      quantitySold: sale.quantitySold.toString(),
      salePricePerTicket: perTicket.toFixed(2),
      salePrice: sale.salePrice?.toString() || "",
      sellCurrency: sale.sellCurrency || "USD",
      saleId: sale.saleId || "",
      siteSold: sale.siteSold || "Stubhub",
      deliveryEmail: sale.deliveryEmail || "",
      deliveryName: sale.deliveryName || "",
    })
    setIsAddingSale(false)
  }

  const resetForm = () => {
    setSaleForm({
      quantitySold: "1",
      salePricePerTicket: "",
      salePrice: "",
      sellCurrency: ticket.buyCurrency || "USD",
      saleId: "",
      siteSold: "Stubhub",
      deliveryEmail: "",
      deliveryName: "",
    })
  }

  const cancelEdit = () => {
    setEditingSale(null)
    setIsAddingSale(false)
    resetForm()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border-2 border-indigo-100 dark:border-slate-700 animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 border-b-2 border-indigo-100 dark:border-slate-700 px-6 py-5 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Manage Sales
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                {ticket.artist} - {ticket.location}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-all duration-200 hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Total Tickets
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {ticket.quantity}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Sold
                </span>
              </div>
              <p className="text-2xl font-black text-green-600 dark:text-green-400">
                {totalSold}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border-2 border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Remaining
                </span>
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {remainingQuantity}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Add/Edit Sale Form */}
          {(isAddingSale || editingSale) && (
            <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border-2 border-indigo-200 dark:border-slate-700">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
                {editingSale ? "Edit Sale" : "Add New Sale"}
              </h3>
              <form onSubmit={editingSale ? handleUpdateSale : handleAddSale}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Quantity Sold
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={remainingQuantity + (editingSale?.quantitySold || 0)}
                      value={saleForm.quantitySold}
                      onChange={(e) =>
                        setSaleForm({ ...saleForm, quantitySold: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700"
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Available: {remainingQuantity + (editingSale?.quantitySold || 0)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Price Per Ticket
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={saleForm.salePricePerTicket}
                      onChange={(e) =>
                        setSaleForm({ ...saleForm, salePricePerTicket: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Total Sale Price
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={saleForm.salePrice}
                        onChange={(e) =>
                          setSaleForm({ ...saleForm, salePrice: e.target.value })
                        }
                        className="flex-1 px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700"
                        required
                      />
                      <select
                        value={saleForm.sellCurrency}
                        onChange={(e) =>
                          setSaleForm({ ...saleForm, sellCurrency: e.target.value })
                        }
                        className="px-3 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-700"
                      >
                        {CURRENCIES.map((curr) => (
                          <option key={curr.code} value={curr.code}>
                            {curr.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Site Sold
                    </label>
                    <select
                      value={saleForm.siteSold}
                      onChange={(e) =>
                        setSaleForm({ ...saleForm, siteSold: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-700"
                    >
                      {SITES.map((site) => (
                        <option key={site} value={site}>
                          {site}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Sale ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={saleForm.saleId}
                      onChange={(e) =>
                        setSaleForm({ ...saleForm, saleId: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700"
                      placeholder="Order/Transaction ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Delivery Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={saleForm.deliveryName}
                      onChange={(e) =>
                        setSaleForm({ ...saleForm, deliveryName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700"
                      placeholder="Buyer's name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Delivery Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={saleForm.deliveryEmail}
                      onChange={(e) =>
                        setSaleForm({ ...saleForm, deliveryEmail: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700"
                      placeholder="buyer@example.com"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-bold"
                  >
                    {editingSale ? "Update Sale" : "Add Sale"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Sale Button */}
          {!isAddingSale && !editingSale && remainingQuantity > 0 && (
            <button
              onClick={() => {
                setIsAddingSale(true)
                resetForm()
              }}
              className="w-full mb-6 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-bold hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Add New Sale
            </button>
          )}

          {remainingQuantity === 0 && !isAddingSale && !editingSale && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
              <p className="text-green-700 dark:text-green-300 font-bold">
                ✓ All tickets have been sold!
              </p>
            </div>
          )}

          {/* Sales List */}
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              Sales History ({sales.length})
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
                  Loading sales...
                </p>
              </div>
            ) : sales.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-12 text-center border-2 border-slate-200 dark:border-slate-700">
                <DollarSign className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">
                  No sales yet
                </p>
                <p className="text-slate-500 dark:text-slate-500">
                  Add your first sale to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="bg-white dark:bg-slate-700 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-bold text-sm">
                            {sale.quantitySold} ticket{sale.quantitySold > 1 ? "s" : ""}
                          </span>
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            {CURRENCIES.find((c) => c.code === sale.sellCurrency)?.symbol}
                            {sale.salePrice?.toFixed(2)}
                          </span>
                          {sale.profit !== null && (
                            <span
                              className={`text-sm font-bold ${
                                sale.profit >= 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {sale.profit >= 0 ? "+" : ""}
                              {CURRENCIES.find((c) => c.code === sale.profitCurrency)?.symbol}
                              {sale.profit.toFixed(2)}
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-lg font-bold text-sm flex items-center gap-1.5 ${
                              sale.ticketsSent
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {sale.ticketsSent ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Sent
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                Not Sent
                              </>
                            )}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {sale.siteSold && (
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 font-medium">
                                Site:
                              </span>{" "}
                              <span className="text-slate-700 dark:text-slate-300 font-bold">
                                {sale.siteSold}
                              </span>
                            </div>
                          )}
                          {sale.saleId && (
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 font-medium">
                                Sale ID:
                              </span>{" "}
                              <span className="text-slate-700 dark:text-slate-300 font-bold">
                                {sale.saleId}
                              </span>
                            </div>
                          )}
                          {sale.deliveryName && (
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 font-medium">
                                Buyer:
                              </span>{" "}
                              <span className="text-slate-700 dark:text-slate-300 font-bold">
                                {sale.deliveryName}
                              </span>
                            </div>
                          )}
                          {sale.deliveryEmail && (
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 font-medium">
                                Email:
                              </span>{" "}
                              <span className="text-slate-700 dark:text-slate-300 font-bold">
                                {sale.deliveryEmail}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleTicketsSent(sale.id)}
                          className={`p-2 rounded-lg transition-all ${
                            sale.ticketsSent
                              ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                              : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                          }`}
                          title={sale.ticketsSent ? "Mark as not sent" : "Mark as sent"}
                        >
                          {sale.ticketsSent ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => startEdit(sale)}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
