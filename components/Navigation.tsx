"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  Ticket,
  Calendar,
  Moon,
  Sun,
  LogOut,
  LayoutGrid,
  List,
  Shield,
} from "lucide-react"
import { CURRENCIES } from "@/lib/currency"
import { useTheme } from "./ThemeProvider"

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface NavigationProps {
  user: User
  displayCurrency: string
  onCurrencyChange: (currency: string) => void
  viewMode?: "card" | "list"
  onViewModeChange?: (mode: "card" | "list") => void
}

export default function Navigation({
  user,
  displayCurrency,
  onCurrencyChange,
  viewMode,
  onViewModeChange,
}: NavigationProps) {
  const pathname = usePathname()
  const { theme = "light", toggleTheme } = useTheme()

  return (
    <header className="relative z-10 glass shadow-lg border-b border-white/10 animate-slideDown">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex justify-between items-center">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-6 animate-slideUp">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg animate-float">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Ticket Platform
              </h1>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-2">
              <Link
                href="/dashboard"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                  pathname === "/dashboard"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/events"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                  pathname === "/events"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Events</span>
              </Link>
              <Link
                href="/accounts"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                  pathname === "/accounts"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Accounts</span>
              </Link>
            </nav>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3 animate-slideUp">
            {/* View Mode Toggle (only show if handler provided) */}
            {onViewModeChange && (
              <div className="hidden sm:flex items-center bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-slate-600 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => onViewModeChange("card")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "card"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onViewModeChange("list")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Theme Toggle */}
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

            {/* Currency Selector */}
            <select
              value={displayCurrency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="px-4 py-2.5 border-2 border-indigo-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-slate-500"
              title="Display Currency"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code}
                </option>
              ))}
            </select>

            {/* User Info */}
            <div className="hidden sm:flex items-center space-x-3 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-600 hover:shadow-md transition-shadow">
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

            {/* Logout Button */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="group flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              <span className="hidden sm:inline font-bold">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center space-x-2 mt-4">
          <Link
            href="/dashboard"
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 ${
              pathname === "/dashboard"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                : "text-white/90 hover:bg-white/10 border border-slate-300 dark:border-slate-600"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/events"
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 ${
              pathname === "/events"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                : "text-white/90 hover:bg-white/10 border border-slate-300 dark:border-slate-600"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Events</span>
          </Link>
          <Link
            href="/accounts"
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 ${
              pathname === "/accounts"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                : "text-white/90 hover:bg-white/10 border border-slate-300 dark:border-slate-600"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Accounts</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
