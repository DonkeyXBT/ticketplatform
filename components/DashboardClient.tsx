"use client"

import { useState, useMemo } from "react"
import { signOut } from "next-auth/react"
import {
  Plus,
  Search,
  Filter,
  LogOut,
  Ticket,
  TrendingUp,
  DollarSign,
  BarChart3,
  Edit,
  Trash2,
  X,
} from "lucide-react"
import { format } from "date-fns"
import TicketModal from "./TicketModal"

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

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

const PLATFORMS = [
  "All Platforms",
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

const STATUSES = ["All", "Listed", "Sold", "Pending", "Cancelled"]

export default function DashboardClient({
  tickets: initialTickets,
  user,
}: {
  tickets: Ticket[]
  user: User
}) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTickets = tickets.length
    const soldTickets = tickets.filter((t) => t.status === "Sold").length
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.salePrice || 0), 0)
    const totalCost = tickets.reduce((sum, t) => sum + (t.buyInPrice || 0), 0)
    const totalProfit = totalRevenue - totalCost

    return {
      totalTickets,
      soldTickets,
      totalRevenue,
      totalProfit,
      averageProfit: totalTickets > 0 ? totalProfit / totalTickets : 0,
    }
  }, [tickets])

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        searchQuery === "" ||
        ticket.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPlatform =
        selectedPlatform === "All Platforms" ||
        ticket.platform === selectedPlatform

      const matchesStatus =
        selectedStatus === "All" || ticket.status === selectedStatus

      return matchesSearch && matchesPlatform && matchesStatus
    })
  }, [tickets, searchQuery, selectedPlatform, selectedStatus])

  const handleAddTicket = () => {
    setEditingTicket(null)
    setIsModalOpen(true)
  }

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket)
    setIsModalOpen(true)
  }

  const handleDeleteTicket = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return

    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setTickets(tickets.filter((t) => t.id !== id))
      }
    } catch (error) {
      console.error("Error deleting ticket:", error)
    }
  }

  const handleSaveTicket = async (ticketData: any) => {
    try {
      if (editingTicket) {
        // Update existing ticket
        const res = await fetch(`/api/tickets/${editingTicket.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ticketData),
        })

        if (res.ok) {
          const updatedTicket = await res.json()
          setTickets(
            tickets.map((t) => (t.id === editingTicket.id ? updatedTicket : t))
          )
        }
      } else {
        // Create new ticket
        const res = await fetch("/api/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ticketData),
        })

        if (res.ok) {
          const newTicket = await res.json()
          setTickets([newTicket, ...tickets])
        }
      }

      setIsModalOpen(false)
      setEditingTicket(null)
    } catch (error) {
      console.error("Error saving ticket:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ticket Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Tickets
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalTickets}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Ticket className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tickets Sold
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.soldTickets}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Profit
                </p>
                <p
                  className={`text-3xl font-bold mt-2 ${
                    stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${stats.totalProfit.toFixed(2)}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  stats.totalProfit >= 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <TrendingUp
                  className={`h-6 w-6 ${
                    stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by artist, location, or order..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Platform Filter */}
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Ticket Button */}
            <button
              onClick={handleAddTicket}
              className="flex items-center justify-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-md"
            >
              <Plus className="h-5 w-5" />
              <span>Add Ticket</span>
            </button>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seat Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buy Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sale Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Ticket className="h-12 w-12 mb-3 opacity-50" />
                        <p className="text-lg font-medium">No tickets found</p>
                        <p className="text-sm mt-1">
                          Add your first ticket to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.artist || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.location || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.eventDate
                            ? format(new Date(ticket.eventDate), "MMM d, yyyy")
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {ticket.section && `Sec ${ticket.section}`}
                          {ticket.row && `, Row ${ticket.row}`}
                          {ticket.seat && `, Seat ${ticket.seat}`}
                          {!ticket.section && !ticket.row && !ticket.seat && "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {ticket.platform || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${ticket.buyInPrice?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${ticket.salePrice?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            (ticket.profit || 0) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          ${ticket.profit?.toFixed(2) || "0.00"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ticket.status === "Sold"
                              ? "bg-green-100 text-green-800"
                              : ticket.status === "Listed"
                              ? "bg-blue-100 text-blue-800"
                              : ticket.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ticket.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditTicket(ticket)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Ticket Modal */}
      {isModalOpen && (
        <TicketModal
          ticket={editingTicket}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTicket(null)
          }}
          onSave={handleSaveTicket}
        />
      )}
    </div>
  )
}
