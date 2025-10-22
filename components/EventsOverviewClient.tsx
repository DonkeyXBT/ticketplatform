"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Ticket,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react"
import { format } from "date-fns"
import Navigation from "./Navigation"
import {
  convertCurrencySync,
  formatCurrency,
} from "@/lib/currency"

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

interface EventGroup {
  key: string
  artist: string
  eventDate: Date | null
  location: string
  tickets: Ticket[]
  totalTickets: number
  soldTickets: number
  listedTickets: number
  totalInvestment: number
  totalRevenue: number
  totalProfit: number
}

export default function EventsOverviewClient({
  tickets: initialTickets,
  user,
}: {
  tickets: Ticket[]
  user: User
}) {
  const [displayCurrency, setDisplayCurrency] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("preferredCurrency") || "USD"
    }
    return "USD"
  })
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  // Save currency preference to localStorage
  const handleCurrencyChange = (newCurrency: string) => {
    setDisplayCurrency(newCurrency)
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredCurrency", newCurrency)
    }
  }

  // Group tickets by event
  const eventGroups = useMemo(() => {
    const groups = new Map<string, EventGroup>()

    initialTickets.forEach((ticket) => {
      // Create a unique key for each event (artist + date + location)
      const eventKey = `${ticket.artist || "Unknown"}_${ticket.eventDate?.toISOString() || "no-date"}_${ticket.location || "Unknown"}`

      if (!groups.has(eventKey)) {
        groups.set(eventKey, {
          key: eventKey,
          artist: ticket.artist || "Unknown Artist",
          eventDate: ticket.eventDate,
          location: ticket.location || "Unknown Location",
          tickets: [],
          totalTickets: 0,
          soldTickets: 0,
          listedTickets: 0,
          totalInvestment: 0,
          totalRevenue: 0,
          totalProfit: 0,
        })
      }

      const group = groups.get(eventKey)!
      const quantity = ticket.quantity || 1
      group.tickets.push(ticket)
      group.totalTickets += quantity

      if (ticket.status === "Sold") {
        group.soldTickets += quantity
      } else if (ticket.status === "Listed") {
        group.listedTickets += quantity
      }

      // Calculate financials (multiply by quantity)
      if (ticket.buyInPrice && ticket.buyCurrency) {
        group.totalInvestment += convertCurrencySync(
          ticket.buyInPrice * quantity,
          ticket.buyCurrency,
          displayCurrency
        )
      }

      if (ticket.salePrice && ticket.sellCurrency && ticket.status === "Sold") {
        group.totalRevenue += convertCurrencySync(
          ticket.salePrice * quantity,
          ticket.sellCurrency,
          displayCurrency
        )
      }

      if (ticket.profit && ticket.profitCurrency && ticket.status === "Sold") {
        group.totalProfit += convertCurrencySync(
          ticket.profit * quantity,
          ticket.profitCurrency,
          displayCurrency
        )
      }
    })

    // Convert to array and sort by event date
    return Array.from(groups.values()).sort((a, b) => {
      if (!a.eventDate) return 1
      if (!b.eventDate) return -1
      return a.eventDate.getTime() - b.eventDate.getTime()
    })
  }, [initialTickets, displayCurrency])

  const toggleEvent = (eventKey: string) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(eventKey)) {
        newSet.delete(eventKey)
      } else {
        newSet.add(eventKey)
      }
      return newSet
    })
  }

  // Calculate overall stats
  const overallStats = useMemo(() => {
    return {
      totalEvents: eventGroups.length,
      totalTickets: eventGroups.reduce((sum, e) => sum + e.totalTickets, 0),
      totalSold: eventGroups.reduce((sum, e) => sum + e.soldTickets, 0),
      totalListed: eventGroups.reduce((sum, e) => sum + e.listedTickets, 0),
      totalInvestment: eventGroups.reduce((sum, e) => sum + e.totalInvestment, 0),
      totalRevenue: eventGroups.reduce((sum, e) => sum + e.totalRevenue, 0),
      totalProfit: eventGroups.reduce((sum, e) => sum + e.totalProfit, 0),
    }
  }, [eventGroups])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>

      {/* Navigation */}
      <Navigation
        user={user}
        displayCurrency={displayCurrency}
        onCurrencyChange={handleCurrencyChange}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 dark:border-purple-900/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-scaleIn">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Total Events
                </p>
                <p className="text-4xl font-black text-slate-900 dark:text-white mt-2">
                  {overallStats.totalEvents}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 dark:border-blue-900/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-scaleIn animation-delay-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Total Tickets
                </p>
                <p className="text-4xl font-black text-slate-900 dark:text-white mt-2">
                  {overallStats.totalTickets}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Ticket className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-emerald-100 dark:border-emerald-900/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-scaleIn animation-delay-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Total Revenue
                </p>
                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                  {formatCurrency(overallStats.totalRevenue, displayCurrency)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-rose-100 dark:border-rose-900/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-scaleIn animation-delay-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Total Profit
                </p>
                <p className={`text-4xl font-black mt-2 ${overallStats.totalProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {formatCurrency(overallStats.totalProfit, displayCurrency)}
                </p>
              </div>
              <div className={`p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${overallStats.totalProfit >= 0 ? "bg-gradient-to-br from-emerald-500 to-green-600" : "bg-gradient-to-br from-red-500 to-rose-600"}`}>
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        {eventGroups.length === 0 ? (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-slate-200 dark:border-slate-700">
            <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
              No Events Yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Add tickets to see your events overview
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-bold"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go to Dashboard</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {eventGroups.map((event, index) => {
              const isExpanded = expandedEvents.has(event.key)
              const isPastEvent = event.eventDate && event.eventDate < new Date()

              return (
                <div
                  key={event.key}
                  className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 overflow-hidden animate-scaleIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Event Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => toggleEvent(event.key)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                            {event.artist}
                          </h3>
                          {isPastEvent && (
                            <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold">
                              Past Event
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                            <Calendar className="h-4 w-4" />
                            <span className="font-semibold">
                              {event.eventDate
                                ? format(new Date(event.eventDate), "PPP")
                                : "Date TBD"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                            <MapPin className="h-4 w-4" />
                            <span className="font-semibold">{event.location}</span>
                          </div>
                        </div>

                        {/* Event Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                              Tickets
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                              {event.totalTickets}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                              Sold
                            </p>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                              {event.soldTickets}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                              Listed
                            </p>
                            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                              {event.listedTickets}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-800">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                              Revenue
                            </p>
                            <p className="text-lg font-black text-purple-600 dark:text-purple-400">
                              {formatCurrency(event.totalRevenue, displayCurrency)}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-800">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                              Profit
                            </p>
                            <p className={`text-lg font-black ${event.totalProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                              {formatCurrency(event.totalProfit, displayCurrency)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button className="ml-4 p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Ticket Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Ticket className="h-5 w-5" />
                        <span>Ticket Details</span>
                      </h4>
                      <div className="space-y-3">
                        {event.tickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-sm">
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
                              <div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                                  Status
                                </p>
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
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
                              <div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                                  Buy Price
                                </p>
                                <p className="font-bold text-slate-900 dark:text-white">
                                  {ticket.buyInPrice && ticket.buyCurrency
                                    ? formatCurrency(
                                        convertCurrencySync(
                                          ticket.buyInPrice,
                                          ticket.buyCurrency,
                                          displayCurrency
                                        ),
                                        displayCurrency
                                      )
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                                  Profit
                                </p>
                                <p
                                  className={`font-bold ${
                                    ticket.profit && ticket.profit >= 0
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {ticket.profit && ticket.profitCurrency
                                    ? formatCurrency(
                                        convertCurrencySync(
                                          ticket.profit,
                                          ticket.profitCurrency,
                                          displayCurrency
                                        ),
                                        displayCurrency
                                      )
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
