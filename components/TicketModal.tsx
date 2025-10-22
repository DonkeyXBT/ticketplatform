"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { CURRENCIES, convertCurrencySync } from "@/lib/currency"

interface Ticket {
  id: string
  purchaseDate: Date | null
  eventDate: Date | null
  artist: string | null
  location: string | null
  section: string | null
  row: string | null
  seat: string | null
  quantity: number | null
  email: string | null
  orderNumber: string | null
  buyInPrice: number | null
  salePrice: number | null
  profit: number | null
  saleId: string | null
  platform: string | null
  status: string | null
  siteSold: string | null
  deliveryEmail: string | null
  deliveryName: string | null
}

interface TicketModalProps {
  ticket: Ticket | null
  onClose: () => void
  onSave: (data: any) => void
}

const PLATFORMS = [
  "Ticketmaster",
  "AXS",
  "Gigs And Tours",
  "SeeTickets",
  "Eventim",
  "Dice",
  "Stubhub",
  "Viagogo",
  "Other",
]

const STATUSES = ["Listed", "Sold", "Pending", "Cancelled"]

export default function TicketModal({ ticket, onClose, onSave }: TicketModalProps) {
  const [formData, setFormData] = useState({
    purchaseDate: "",
    eventDate: "",
    artist: "",
    location: "",
    section: "",
    row: "",
    seat: "",
    quantity: "1",
    email: "",
    orderNumber: "",
    buyPricePerTicket: "",
    buyInPrice: "",
    buyCurrency: "USD",
    salePricePerTicket: "",
    salePrice: "",
    sellCurrency: "USD",
    saleId: "",
    platform: "Ticketmaster",
    status: "Listed",
    siteSold: "",
    deliveryEmail: "",
    deliveryName: "",
  })

  const [calculatedProfit, setCalculatedProfit] = useState(0)

  useEffect(() => {
    if (ticket) {
      const quantity = ticket.quantity || 1
      const buyTotal = ticket.buyInPrice || 0
      const saleTotal = ticket.salePrice || 0

      setFormData({
        purchaseDate: ticket.purchaseDate
          ? new Date(ticket.purchaseDate).toISOString().split("T")[0]
          : "",
        eventDate: ticket.eventDate
          ? new Date(ticket.eventDate).toISOString().split("T")[0]
          : "",
        artist: ticket.artist || "",
        location: ticket.location || "",
        section: ticket.section || "",
        row: ticket.row || "",
        seat: ticket.seat || "",
        quantity: quantity.toString(),
        email: ticket.email || "",
        orderNumber: ticket.orderNumber || "",
        buyPricePerTicket: quantity > 0 ? (buyTotal / quantity).toFixed(2) : "",
        buyInPrice: buyTotal.toString(),
        buyCurrency: (ticket as any).buyCurrency || "USD",
        salePricePerTicket: quantity > 0 ? (saleTotal / quantity).toFixed(2) : "",
        salePrice: saleTotal.toString(),
        sellCurrency: (ticket as any).sellCurrency || "USD",
        saleId: ticket.saleId || "",
        platform: ticket.platform || "Ticketmaster",
        status: ticket.status || "Listed",
        siteSold: ticket.siteSold || "",
        deliveryEmail: ticket.deliveryEmail || "",
        deliveryName: ticket.deliveryName || "",
      })
    }
  }, [ticket])

  // Auto-calculate total buy price from per-ticket price × quantity
  useEffect(() => {
    const perTicket = parseFloat(formData.buyPricePerTicket) || 0
    const qty = parseInt(formData.quantity) || 1
    const total = perTicket * qty

    setFormData((prev) => ({
      ...prev,
      buyInPrice: total > 0 ? total.toFixed(2) : "",
    }))
  }, [formData.buyPricePerTicket, formData.quantity])

  // Auto-calculate total sale price from per-ticket price × quantity
  useEffect(() => {
    const perTicket = parseFloat(formData.salePricePerTicket) || 0
    const qty = parseInt(formData.quantity) || 1
    const total = perTicket * qty

    setFormData((prev) => ({
      ...prev,
      salePrice: total > 0 ? total.toFixed(2) : "",
    }))
  }, [formData.salePricePerTicket, formData.quantity])

  useEffect(() => {
    const buyIn = parseFloat(formData.buyInPrice) || 0
    const sale = parseFloat(formData.salePrice) || 0

    // Convert sale price to buy currency for profit calculation
    const saleInBuyCurrency = convertCurrencySync(
      sale,
      formData.sellCurrency,
      formData.buyCurrency
    )

    setCalculatedProfit(saleInBuyCurrency - buyIn)
  }, [formData.buyInPrice, formData.salePrice, formData.buyCurrency, formData.sellCurrency])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-indigo-100 dark:border-slate-700 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 border-b-2 border-indigo-100 dark:border-slate-700 px-6 py-5 flex items-center justify-between backdrop-blur-sm z-10">
          <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            {ticket ? "Edit Ticket" : "Add New Ticket"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Details */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-full mr-3"></div>
                Event Details
              </h3>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Artist / Event Name
              </label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Enter artist or event name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Location / Venue
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Enter venue or location"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Purchase Date
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Event Date
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700"
              />
            </div>

            {/* Seat Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-full mr-3"></div>
                Seat Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Section
              </label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="e.g., A1, Floor, Balcony"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Row
              </label>
              <input
                type="text"
                name="row"
                value={formData.row}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="e.g., 12, AA"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Seat
              </label>
              <input
                type="text"
                name="seat"
                value={formData.seat}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="e.g., 15, 16-17"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="1"
              />
            </div>

            {/* Purchase Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-full mr-3"></div>
                Purchase Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Platform
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-700"
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Order Number
              </label>
              <input
                type="text"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Order/confirmation number"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Purchase Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Email used for purchase"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Buy Currency
              </label>
              <select
                name="buyCurrency"
                value={formData.buyCurrency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-700"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Price Per Ticket
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold">
                  {CURRENCIES.find((c) => c.code === formData.buyCurrency)?.symbol}
                </span>
                <input
                  type="number"
                  name="buyPricePerTicket"
                  value={formData.buyPricePerTicket}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="0.00"
                />
              </div>
              {formData.buyPricePerTicket && (
                <p className="mt-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  Total: {CURRENCIES.find((c) => c.code === formData.buyCurrency)?.symbol}
                  {formData.buyInPrice} {formData.buyCurrency} ({formData.quantity} × {CURRENCIES.find((c) => c.code === formData.buyCurrency)?.symbol}{formData.buyPricePerTicket})
                </p>
              )}
            </div>

            {/* Sale Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-full mr-3"></div>
                Sale Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-700"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Sell Currency
              </label>
              <select
                name="sellCurrency"
                value={formData.sellCurrency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-700"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Sale Price Per Ticket
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold">
                  {CURRENCIES.find((c) => c.code === formData.sellCurrency)?.symbol}
                </span>
                <input
                  type="number"
                  name="salePricePerTicket"
                  value={formData.salePricePerTicket}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="0.00"
                />
              </div>
              {formData.salePricePerTicket && (
                <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Total: {CURRENCIES.find((c) => c.code === formData.sellCurrency)?.symbol}
                  {formData.salePrice} {formData.sellCurrency} ({formData.quantity} × {CURRENCIES.find((c) => c.code === formData.sellCurrency)?.symbol}{formData.salePricePerTicket})
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Site Sold On
              </label>
              <input
                type="text"
                name="siteSold"
                value={formData.siteSold}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="e.g., Stubhub, Viagogo"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Sale ID
              </label>
              <input
                type="text"
                name="saleId"
                value={formData.saleId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Sale/listing ID"
              />
            </div>

            {/* Delivery Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-full mr-3"></div>
                Delivery Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Delivery Email
              </label>
              <input
                type="email"
                name="deliveryEmail"
                value={formData.deliveryEmail}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Buyer's email"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Delivery Name
              </label>
              <input
                type="text"
                name="deliveryName"
                value={formData.deliveryName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Buyer's name"
              />
            </div>

            {/* Profit Display */}
            <div className="md:col-span-2 mt-6">
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-blue-900/30 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-black text-slate-800 dark:text-slate-200">
                    Calculated Profit:
                  </span>
                  <span
                    className={`text-3xl font-black ${
                      calculatedProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {CURRENCIES.find((c) => c.code === formData.buyCurrency)?.symbol}
                    {calculatedProfit.toFixed(2)} {formData.buyCurrency}
                  </span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-bold">
                    💰 Buy: {CURRENCIES.find((c) => c.code === formData.buyCurrency)?.symbol}{parseFloat(formData.buyInPrice) || 0} {formData.buyCurrency}
                  </p>
                  <p className="font-bold">
                    💵 Sell: {CURRENCIES.find((c) => c.code === formData.sellCurrency)?.symbol}{parseFloat(formData.salePrice) || 0} {formData.sellCurrency}
                    {formData.buyCurrency !== formData.sellCurrency && (
                      <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                        (≈ {CURRENCIES.find((c) => c.code === formData.buyCurrency)?.symbol}
                        {convertCurrencySync(parseFloat(formData.salePrice) || 0, formData.sellCurrency, formData.buyCurrency).toFixed(2)} {formData.buyCurrency})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 mt-10 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="group px-8 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="group px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-bold hover:scale-105"
            >
              {ticket ? "Update Ticket" : "Add Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
