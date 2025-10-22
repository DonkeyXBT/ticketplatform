"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface Ticket {
  id: string
  purchaseDate: Date | null
  eventDate: Date | null
  artist: string | null
  location: string | null
  section: string | null
  row: string | null
  seat: string | null
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
    email: "",
    orderNumber: "",
    buyInPrice: "",
    salePrice: "",
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
        email: ticket.email || "",
        orderNumber: ticket.orderNumber || "",
        buyInPrice: ticket.buyInPrice?.toString() || "",
        salePrice: ticket.salePrice?.toString() || "",
        saleId: ticket.saleId || "",
        platform: ticket.platform || "Ticketmaster",
        status: ticket.status || "Listed",
        siteSold: ticket.siteSold || "",
        deliveryEmail: ticket.deliveryEmail || "",
        deliveryName: ticket.deliveryName || "",
      })
    }
  }, [ticket])

  useEffect(() => {
    const buyIn = parseFloat(formData.buyInPrice) || 0
    const sale = parseFloat(formData.salePrice) || 0
    setCalculatedProfit(sale - buyIn)
  }, [formData.buyInPrice, formData.salePrice])

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {ticket ? "Edit Ticket" : "Add New Ticket"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Details */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Event Details
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artist / Event Name
              </label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter artist or event name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location / Venue
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter venue or location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Seat Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Seat Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., A1, Floor, Balcony"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Row
              </label>
              <input
                type="text"
                name="row"
                value={formData.row}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 12, AA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seat
              </label>
              <input
                type="text"
                name="seat"
                value={formData.seat}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 15, 16-17"
              />
            </div>

            {/* Purchase Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Purchase Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <input
                type="text"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Order/confirmation number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Email used for purchase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buy-in Price ($)
              </label>
              <input
                type="number"
                name="buyInPrice"
                value={formData.buyInPrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Sale Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sale Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price ($)
              </label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Sold On
              </label>
              <input
                type="text"
                name="siteSold"
                value={formData.siteSold}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Stubhub, Viagogo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale ID
              </label>
              <input
                type="text"
                name="saleId"
                value={formData.saleId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Sale/listing ID"
              />
            </div>

            {/* Delivery Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Email
              </label>
              <input
                type="email"
                name="deliveryEmail"
                value={formData.deliveryEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Buyer's email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Name
              </label>
              <input
                type="text"
                name="deliveryName"
                value={formData.deliveryName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Buyer's name"
              />
            </div>

            {/* Profit Display */}
            <div className="md:col-span-2 mt-4">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">
                    Calculated Profit:
                  </span>
                  <span
                    className={`text-2xl font-bold ${
                      calculatedProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${calculatedProfit.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Automatically calculated: Sale Price - Buy-in Price
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-md"
            >
              {ticket ? "Update Ticket" : "Add Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
