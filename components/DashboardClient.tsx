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
  const [displayCurrency, setDisplayCurrency] = useState(() => {
    // Load saved currency from localStorage on mount
    if (typeof window !== "undefined") {
      return localStorage.getItem("preferredCurrency") || "USD"
    }
    return "USD"
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const { theme = "light", toggleTheme } = useTheme()

  // Save currency preference to localStorage whenever it changes
  const handleCurrencyChange = (newCurrency: string) => {
    setDisplayCurrency(newCurrency)
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredCurrency", newCurrency)
    }
  }

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
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-indigo-100 dark:border-slate-700 animate-slideDown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 animate-slideUp">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-3 rounded-xl shadow-lg animate-float">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Ticket Platform
              </h1>
            </div>
            <div className="flex items-center space-x-3 animate-slideUp">
              <button
                onClick={toggleTheme}
                className="group p-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-amber-500 transition-transform group-hover:rotate-180 duration-500" />
                ) : (
                  <Moon className="h-5 w-5 text-indigo-600 transition-transform group-hover:-rotate-12 duration-300" />
                )}
              </button>
              <select
                value={displayCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="px-4 py-2.5 border-2 border-indigo-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-slate-500"
                title="Display Currency"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-600 hover:shadow-md transition-shadow">
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-9 w-9 rounded-full ring-2 ring-indigo-300 dark:ring-indigo-500"
                  />
                )}
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {user.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="group flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
              >
                <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                <span className="font-bold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

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

        {/* Tickets Table */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-700 overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-b-2 border-indigo-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Seat Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Buy Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Sale Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
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
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-black text-slate-800 dark:text-slate-200">
                            {ticket.artist || "N/A"}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
                            {ticket.location || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {ticket.eventDate
                            ? format(new Date(ticket.eventDate), "MMM d, yyyy")
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {ticket.section && `Sec ${ticket.section}`}
                          {ticket.row && `, Row ${ticket.row}`}
                          {ticket.seat && `, Seat ${ticket.seat}`}
                          {!ticket.section && !ticket.row && !ticket.seat && "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-black rounded-lg bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                          {ticket.platform || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-800 dark:text-slate-200">
                        {formatCurrency(
                          convertCurrencySync(
                            ticket.buyInPrice || 0,
                            ticket.buyCurrency || "USD",
                            displayCurrency
                          ),
                          displayCurrency
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-800 dark:text-slate-200">
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
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
