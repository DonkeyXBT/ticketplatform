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
  Moon,
  Sun,
  Download,
} from "lucide-react"
import { format } from "date-fns"
import TicketModal from "./TicketModal"
import {
  CURRENCIES,
  convertCurrencySync,
  getCurrencySymbol,
  formatCurrency,
} from "@/lib/currency"
import { useTheme } from "./ThemeProvider"

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
  const [displayCurrency, setDisplayCurrency] = useState("USD")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const { theme = "light", toggleTheme } = useTheme()

  // Calculate statistics with currency conversion
  const stats = useMemo(() => {
    const totalTickets = tickets.length
    const soldTickets = tickets.filter((t) => t.status === "Sold").length

    // Convert all amounts to display currency
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
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-indigo-100 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-2.5 rounded-xl shadow-lg">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Ticket Platform
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition shadow-sm"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-indigo-600" />
                )}
              </button>
              <select
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value)}
                className="px-4 py-2 border-2 border-indigo-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-800 shadow-sm"
                title="Display Currency"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-600">
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-9 w-9 rounded-full ring-2 ring-indigo-200 dark:ring-indigo-400"
                  />
                )}
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {user.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition shadow-md hover:shadow-lg"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Total Tickets
                </p>
                <p className="text-4xl font-bold text-slate-900 mt-2">
                  {stats.totalTickets}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3.5 rounded-xl shadow-md">
                <Ticket className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-emerald-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Tickets Sold
                </p>
                <p className="text-4xl font-bold text-slate-900 mt-2">
                  {stats.soldTickets}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3.5 rounded-xl shadow-md">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Total Revenue
                </p>
                <p className="text-4xl font-bold text-slate-900 mt-2">
                  {formatCurrency(stats.totalRevenue, displayCurrency)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3.5 rounded-xl shadow-md">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-emerald-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Total Profit
                </p>
                <p
                  className={`text-4xl font-bold mt-2 ${
                    stats.totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatCurrency(stats.totalProfit, displayCurrency)}
                </p>
              </div>
              <div
                className={`p-3.5 rounded-xl shadow-md ${
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
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-indigo-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
                <input
                  type="text"
                  placeholder="Search by artist, location, or order..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-700 placeholder-slate-400"
                />
              </div>

              {/* Platform Filter */}
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-700 font-medium bg-white"
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
                className="px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-700 font-medium bg-white"
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
                className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl transition shadow-lg hover:shadow-xl font-semibold"
                title="Export to CSV"
              >
                <Download className="h-5 w-5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleAddTicket}
                className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus className="h-5 w-5" />
                <span>Add Ticket</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b-2 border-indigo-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Seat Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Buy Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Sale Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-2xl mb-4">
                          <Ticket className="h-16 w-16 text-indigo-400" />
                        </div>
                        <p className="text-xl font-bold text-slate-700">No tickets found</p>
                        <p className="text-sm mt-2 text-slate-500">
                          Add your first ticket to get started tracking your sales
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            {ticket.artist || "N/A"}
                          </div>
                          <div className="text-sm text-slate-600 font-medium">
                            {ticket.location || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-700">
                          {ticket.eventDate
                            ? format(new Date(ticket.eventDate), "MMM d, yyyy")
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">
                          {ticket.section && `Sec ${ticket.section}`}
                          {ticket.row && `, Row ${ticket.row}`}
                          {ticket.seat && `, Seat ${ticket.seat}`}
                          {!ticket.section && !ticket.row && !ticket.seat && "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-lg bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-700 border border-indigo-200">
                          {ticket.platform || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                        {formatCurrency(
                          convertCurrencySync(
                            ticket.buyInPrice || 0,
                            ticket.buyCurrency || "USD",
                            displayCurrency
                          ),
                          displayCurrency
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                        {formatCurrency(
                          convertCurrencySync(
                            ticket.salePrice || 0,
                            ticket.sellCurrency || "USD",
                            displayCurrency
                          ),
                          displayCurrency
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-extrabold ${
                            (ticket.profit || 0) >= 0
                              ? "text-emerald-600"
                              : "text-rose-600"
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-lg border ${
                            ticket.status === "Sold"
                              ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
                              : ticket.status === "Listed"
                              ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200"
                              : ticket.status === "Pending"
                              ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200"
                              : "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {ticket.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditTicket(ticket)}
                          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded-lg transition mr-2"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-2 rounded-lg transition"
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
