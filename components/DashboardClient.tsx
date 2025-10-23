"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Search,
  Filter,
  Ticket,
  TrendingUp,
  DollarSign,
  BarChart3,
  Edit,
  Trash2,
  X,
  Download,
  Users,
} from "lucide-react"
import { format } from "date-fns"
import TicketModal from "./TicketModal"
import SalesManager from "./SalesManager"
import Navigation from "./Navigation"
import {
  convertCurrencySync,
  formatCurrency,
} from "@/lib/currency"

interface Sale {
  id: string
  quantitySold: number
  salePrice: number | null
  sellCurrency: string | null
  profit: number | null
  profitCurrency: string | null
  createdAt: Date
}

interface Ticket {
  id: string
  purchaseDate: Date | null
  eventDate: Date | null
  artist: string | null
  location: string | null
  section: string | null
  row: string | null
  seat: string | null
  quantity: number
  email: string | null
  orderNumber: string | null
  buyInPrice: number | null
  buyCurrency: string | null
  salePrice: number | null
  sellCurrency: string | null
  profit: number | null
  profitCurrency: string | null
  saleId: string | null
  platform: string | null
  status: string | null
  siteSold: string | null
  deliveryEmail: string | null
  deliveryName: string | null
  sales: Sale[]
  totalSold: number
  remainingQuantity: number
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
  const [displayCurrency, setDisplayCurrency] = useState(() => {
    // Load saved currency from localStorage on mount
    if (typeof window !== "undefined") {
      return localStorage.getItem("preferredCurrency") || "USD"
    }
    return "USD"
  })
  const [viewMode, setViewMode] = useState<"card" | "list">(() => {
    // Load saved view mode from localStorage on mount
    if (typeof window !== "undefined") {
      return (localStorage.getItem("viewMode") as "card" | "list") || "list"
    }
    return "list"
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [isSalesManagerOpen, setIsSalesManagerOpen] = useState(false)
  const [managingSalesTicket, setManagingSalesTicket] = useState<Ticket | null>(null)

  // Save currency preference to localStorage whenever it changes
  const handleCurrencyChange = (newCurrency: string) => {
    setDisplayCurrency(newCurrency)
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredCurrency", newCurrency)
    }
  }

  // Save view mode preference to localStorage whenever it changes
  const handleViewModeChange = (newMode: "card" | "list") => {
    setViewMode(newMode)
    if (typeof window !== "undefined") {
      localStorage.setItem("viewMode", newMode)
    }
  }

  // Calculate statistics with currency conversion
  const stats = useMemo(() => {
    // Sum up quantities instead of counting entries
    const totalTickets = tickets.reduce((sum, t) => sum + (t.quantity || 1), 0)
    const soldTickets = tickets
      .filter((t) => t.status === "Sold")
      .reduce((sum, t) => sum + (t.quantity || 1), 0)

    // Convert all amounts to display currency
    // Note: salePrice and buyInPrice are already totals (price per ticket × quantity)
    const totalRevenue = tickets.reduce((sum, t) => {
      const amount = t.salePrice || 0
      const ticketCurrency = t.sellCurrency || "USD"
      const converted = convertCurrencySync(amount, ticketCurrency, displayCurrency)
      return sum + converted
    }, 0)

    const totalCost = tickets.reduce((sum, t) => {
      const amount = t.buyInPrice || 0
      const ticketCurrency = t.buyCurrency || "USD"
      const converted = convertCurrencySync(amount, ticketCurrency, displayCurrency)
      return sum + converted
    }, 0)

    const totalProfit = totalRevenue - totalCost

    return {
      totalTickets,
      soldTickets,
      totalRevenue,
      totalProfit,
      averageProfit: totalTickets > 0 ? totalProfit / totalTickets : 0,
    }
  }, [tickets, displayCurrency])

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

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets")
      if (res.ok) {
        const data = await res.json()
        setTickets(data)
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    }
  }

  const handleAddTicket = () => {
    setEditingTicket(null)
    setIsModalOpen(true)
  }

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket)
    setIsModalOpen(true)
  }

  const handleManageSales = (ticket: Ticket) => {
    setManagingSalesTicket(ticket)
    setIsSalesManagerOpen(true)
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
      // Filter out per-ticket price fields (used only for UI calculation)
      const { buyPricePerTicket, salePricePerTicket, ...dataToSend } = ticketData

      if (editingTicket) {
        // Update existing ticket
        const res = await fetch(`/api/tickets/${editingTicket.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        })

        if (res.ok) {
          const updatedTicket = await res.json()
          setTickets(
            tickets.map((t) => (t.id === editingTicket.id ? updatedTicket : t))
          )
        } else {
          const error = await res.json()
          console.error("Failed to update ticket:", error)
          alert(`Failed to update ticket: ${error.error || "Unknown error"}`)
        }
      } else {
        // Create new ticket
        const res = await fetch("/api/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        })

        if (res.ok) {
          const newTicket = await res.json()
          setTickets([newTicket, ...tickets])
        } else {
          const error = await res.json()
          console.error("Failed to create ticket:", error)
          alert(`Failed to create ticket: ${error.error || "Unknown error"}`)
        }
      }

      setIsModalOpen(false)
      setEditingTicket(null)
    } catch (error) {
      console.error("Error saving ticket:", error)
      alert(`Error saving ticket: ${error}`)
    }
  }

  // Export to CSV function
  const exportToCSV = () => {
    const headers = [
      "Artist/Event",
      "Location",
      "Event Date",
      "Section",
      "Row",
      "Seat",
      "Platform",
      "Order Number",
      "Buy Price",
      "Buy Currency",
      "Sale Price",
      "Sell Currency",
      "Profit",
      "Profit Currency",
      "Status",
      "Site Sold",
      "Purchase Date",
    ]

    const rows = filteredTickets.map((ticket) => [
      ticket.artist || "",
      ticket.location || "",
      ticket.eventDate ? format(new Date(ticket.eventDate), "yyyy-MM-dd") : "",
      ticket.section || "",
      ticket.row || "",
      ticket.seat || "",
      ticket.platform || "",
      ticket.orderNumber || "",
      ticket.buyInPrice || "",
      ticket.buyCurrency || "USD",
      ticket.salePrice || "",
      ticket.sellCurrency || "USD",
      ticket.profit || "",
      ticket.profitCurrency || ticket.buyCurrency || "USD",
      ticket.status || "",
      ticket.siteSold || "",
      ticket.purchaseDate
        ? format(new Date(ticket.purchaseDate), "yyyy-MM-dd")
        : "",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `tickets-${format(new Date(), "yyyy-MM-dd")}.csv`
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>

      {/* Navigation */}
      <Navigation
        user={user}
        displayCurrency={displayCurrency}
        onCurrencyChange={handleCurrencyChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 dark:border-purple-900/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-scaleIn">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Total Tickets
                </p>
                <p className="text-4xl font-black text-slate-900 dark:text-white mt-2">
                  {stats.totalTickets}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Ticket className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-emerald-100 dark:border-emerald-900/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-scaleIn" style={{animationDelay: "0.1s"}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Tickets Sold
                </p>
                <p className="text-4xl font-black text-slate-900 dark:text-white mt-2">
                  {stats.soldTickets}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 dark:border-blue-900/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-scaleIn" style={{animationDelay: "0.2s"}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Total Revenue
                </p>
                <p className="text-4xl font-black text-slate-900 dark:text-white mt-2">
                  {formatCurrency(stats.totalRevenue, displayCurrency)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-emerald-100 dark:border-emerald-900/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-scaleIn" style={{animationDelay: "0.3s"}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Total Profit
                </p>
                <p
                  className={`text-4xl font-black mt-2 ${
                    stats.totalProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {formatCurrency(stats.totalProfit, displayCurrency)}
                </p>
              </div>
              <div
                className={`p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                  stats.totalProfit >= 0
                    ? "bg-gradient-to-br from-emerald-500 to-green-600"
                    : "bg-gradient-to-br from-rose-500 to-red-600"
                }`}
              >
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-indigo-100 dark:border-slate-700 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400 dark:text-indigo-500" />
                <input
                  type="text"
                  placeholder="Search by artist, location, or order..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 font-medium"
                />
              </div>

              {/* Platform Filter */}
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-700 hover:border-indigo-300 dark:hover:border-slate-500"
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
                className="px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-700 hover:border-indigo-300 dark:hover:border-slate-500"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={exportToCSV}
                className="group flex items-center justify-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-bold hover:scale-105"
                title="Export to CSV"
              >
                <Download className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleAddTicket}
                className="group flex items-center justify-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-bold hover:scale-105"
              >
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                <span>Add Ticket</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tickets View */}
        {viewMode === "list" ? (
          /* List View - Compact Table */
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-700 overflow-hidden animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-b-2 border-indigo-100 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Seat Info
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Buy Price
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Sale Price
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 p-6 rounded-2xl mb-4">
                          <Ticket className="h-16 w-16 text-indigo-400 dark:text-indigo-500" />
                        </div>
                        <p className="text-xl font-black text-slate-700 dark:text-slate-300">No tickets found</p>
                        <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">
                          Add your first ticket to get started tracking your sales
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-indigo-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                    >
                      <td className="px-4 py-2">
                        <div>
                          <div className="text-sm font-black text-slate-800 dark:text-slate-200">
                            {ticket.artist || "N/A"}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
                            {ticket.location || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {ticket.eventDate
                            ? format(new Date(ticket.eventDate), "MMM d, yyyy")
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {ticket.section && `Sec ${ticket.section}`}
                          {ticket.row && `, Row ${ticket.row}`}
                          {ticket.seat && `, Seat ${ticket.seat}`}
                          {!ticket.section && !ticket.row && !ticket.seat && "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-sm leading-5 font-black rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                          {ticket.quantity || 1}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-black rounded-lg bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                          {ticket.platform || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-black text-slate-800 dark:text-slate-200">
                        {formatCurrency(
                          convertCurrencySync(
                            ticket.buyInPrice || 0,
                            ticket.buyCurrency || "USD",
                            displayCurrency
                          ),
                          displayCurrency
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-black text-slate-800 dark:text-slate-200">
                        {formatCurrency(
                          convertCurrencySync(
                            ticket.salePrice || 0,
                            ticket.sellCurrency || "USD",
                            displayCurrency
                          ),
                          displayCurrency
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`text-sm font-black ${
                            (ticket.profit || 0) >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {formatCurrency(
                            convertCurrencySync(
                              ticket.profit || 0,
                              ticket.profitCurrency || ticket.buyCurrency || "USD",
                              displayCurrency
                            ),
                            displayCurrency
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 inline-flex text-xs leading-5 font-black rounded-lg border ${
                            ticket.status === "Sold"
                              ? "bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                              : ticket.status === "Listed"
                              ? "bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                              : ticket.status === "Pending"
                              ? "bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
                              : "bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-700 dark:to-gray-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                          }`}
                        >
                          {ticket.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleManageSales(ticket)}
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 p-2 rounded-lg transition-all mr-2"
                          title="Manage Sales"
                        >
                          <Users className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditTicket(ticket)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-2 rounded-lg transition-all mr-2"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2 rounded-lg transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {filteredTickets.length === 0 ? (
              <div className="col-span-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-slate-200 dark:border-slate-700">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 p-6 rounded-2xl mb-4 inline-block">
                  <Ticket className="h-16 w-16 text-indigo-400 dark:text-indigo-500" />
                </div>
                <p className="text-xl font-black text-slate-700 dark:text-slate-300">No tickets found</p>
                <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">
                  Add your first ticket to get started tracking your sales
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 border-b border-indigo-100 dark:border-slate-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
                          {ticket.artist || "N/A"}
                        </h3>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 truncate">
                          {ticket.location || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-black ${
                          ticket.status === "Sold"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : ticket.status === "Listed"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {ticket.status || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                          Event Date
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {ticket.eventDate
                            ? format(new Date(ticket.eventDate), "MMM d, yyyy")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                          Platform
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {ticket.platform || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                          Section
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {ticket.section || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                          Row
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {ticket.row || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                          Seat
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {ticket.seat || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                          Qty
                        </p>
                        <p className="font-black text-emerald-600 dark:text-emerald-400">
                          {ticket.quantity || 1}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                            Buy Price
                          </p>
                          <p className="font-black text-slate-900 dark:text-white">
                            {formatCurrency(
                              convertCurrencySync(
                                ticket.buyInPrice || 0,
                                ticket.buyCurrency || "USD",
                                displayCurrency
                              ),
                              displayCurrency
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                            Sale Price
                          </p>
                          <p className="font-black text-slate-900 dark:text-white">
                            {formatCurrency(
                              convertCurrencySync(
                                ticket.salePrice || 0,
                                ticket.sellCurrency || "USD",
                                displayCurrency
                              ),
                              displayCurrency
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                            Profit
                          </p>
                          <p
                            className={`font-black ${
                              (ticket.profit || 0) >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {formatCurrency(
                              convertCurrencySync(
                                ticket.profit || 0,
                                ticket.profitCurrency || ticket.buyCurrency || "USD",
                                displayCurrency
                              ),
                              displayCurrency
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer - Actions */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>{ticket.totalSold} / {ticket.quantity} sold</span>
                      {ticket.remainingQuantity > 0 && (
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                          {ticket.remainingQuantity} left
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleManageSales(ticket)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 text-sm font-bold"
                        title="Manage Sales"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Sales</span>
                      </button>
                      <button
                        onClick={() => handleEditTicket(ticket)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 text-sm font-bold"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all duration-200 text-sm font-bold"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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

      {/* Sales Manager Modal */}
      {isSalesManagerOpen && managingSalesTicket && (
        <SalesManager
          ticket={managingSalesTicket}
          onClose={() => {
            setIsSalesManagerOpen(false)
            setManagingSalesTicket(null)
            // Refresh tickets to get updated sales data
            fetchTickets()
          }}
        />
      )}
    </div>
  )
}
