"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  Copy,
  Check,
  Key,
  Shield,
  LayoutGrid,
  List,
  Maximize2,
} from "lucide-react"
import Navigation from "./Navigation"
import TOTPDisplay from "./TOTPDisplay"
import QRCode from "qrcode"

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface PlatformAccount {
  id: string
  platform: string
  email: string
  password: string
  twoFA: string | null
  telephoneNumber: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
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

export default function AccountsClient({ user }: { user: User }) {
  const [accounts, setAccounts] = useState<PlatformAccount[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<string>(PLATFORMS[0])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<PlatformAccount | null>(null)
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({})
  const [showTwoFASecret, setShowTwoFASecret] = useState<{ [key: string]: boolean }>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [bulkText, setBulkText] = useState("")
  const [displayCurrency, setDisplayCurrency] = useState("USD")
  const [viewMode, setViewMode] = useState<"list" | "card" | "detailed">(() => {
    // Load saved view mode from localStorage on mount
    if (typeof window !== "undefined") {
      return (localStorage.getItem("accountsViewMode") as "list" | "card" | "detailed") || "card"
    }
    return "card"
  })

  const [formData, setFormData] = useState({
    platform: PLATFORMS[0],
    email: "",
    password: "",
    twoFA: "",
    telephoneNumber: "",
    notes: "",
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  // Generate QR code when 2FA is entered
  useEffect(() => {
    if (formData.twoFA && formData.email) {
      const otpauth = `otpauth://totp/${encodeURIComponent(
        formData.platform
      )}:${encodeURIComponent(formData.email)}?secret=${formData.twoFA}&issuer=${encodeURIComponent(
        formData.platform
      )}`

      QRCode.toDataURL(otpauth, { width: 200 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("QR code generation failed:", err))
    } else {
      setQrCodeUrl(null)
    }
  }, [formData.twoFA, formData.email, formData.platform])

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/platform-accounts")
      if (res.ok) {
        const data = await res.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingAccount) {
        const res = await fetch(`/api/platform-accounts/${editingAccount.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (res.ok) {
          const updated = await res.json()
          setAccounts(accounts.map((a) => (a.id === editingAccount.id ? updated : a)))
        }
      } else {
        const res = await fetch("/api/platform-accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (res.ok) {
          const newAccount = await res.json()
          setAccounts([newAccount, ...accounts])
        }
      }

      closeModal()
    } catch (error) {
      console.error("Error saving account:", error)
      alert("Failed to save account")
    }
  }

  const handleBulkImport = async () => {
    try {
      const lines = bulkText.trim().split("\n")
      const accountsToImport = []

      for (const line of lines) {
        if (!line.trim()) continue

        const parts = line.split(":")
        if (parts.length < 3) {
          alert(`Invalid format on line: ${line}\nExpected: email:password:2fa:phone`)
          return
        }

        accountsToImport.push({
          platform: selectedPlatform,
          email: parts[0].trim(),
          password: parts[1].trim(),
          twoFA: parts[2]?.trim() || null,
          telephoneNumber: parts[3]?.trim() || null,
        })
      }

      const res = await fetch("/api/platform-accounts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accounts: accountsToImport }),
      })

      if (res.ok) {
        const result = await res.json()
        alert(result.message)
        fetchAccounts()
        setIsBulkModalOpen(false)
        setBulkText("")
      } else {
        const error = await res.json()
        alert(`Failed to import: ${error.error}`)
      }
    } catch (error) {
      console.error("Error bulk importing:", error)
      alert("Failed to import accounts")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return

    try {
      const res = await fetch(`/api/platform-accounts/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setAccounts(accounts.filter((a) => a.id !== id))
      }
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  const openModal = (account?: PlatformAccount) => {
    if (account) {
      setEditingAccount(account)
      setFormData({
        platform: account.platform,
        email: account.email,
        password: account.password,
        twoFA: account.twoFA || "",
        telephoneNumber: account.telephoneNumber || "",
        notes: account.notes || "",
      })
    } else {
      setEditingAccount(null)
      setFormData({
        platform: selectedPlatform,
        email: "",
        password: "",
        twoFA: "",
        telephoneNumber: "",
        notes: "",
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAccount(null)
    setQrCodeUrl(null)
    setFormData({
      platform: PLATFORMS[0],
      email: "",
      password: "",
      twoFA: "",
      telephoneNumber: "",
      notes: "",
    })
  }

  const handleViewModeChange = (newMode: "list" | "card" | "detailed") => {
    setViewMode(newMode)
    if (typeof window !== "undefined") {
      localStorage.setItem("accountsViewMode", newMode)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const filteredAccounts = accounts.filter((a) => a.platform === selectedPlatform)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Navigation
        user={user}
        displayCurrency={displayCurrency}
        onCurrencyChange={setDisplayCurrency}
        viewMode={viewMode as "card" | "list"}
        onViewModeChange={(mode) => handleViewModeChange(mode === "card" ? "card" : "list")}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
            Platform Accounts
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Securely manage your ticket platform credentials
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-bold hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Add Account
            </button>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all duration-200 font-bold hover:scale-105"
            >
              <Upload className="h-5 w-5" />
              Bulk Import
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-slate-600 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => handleViewModeChange("list")}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewModeChange("card")}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                viewMode === "card"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title="Card View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewModeChange("detailed")}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                viewMode === "detailed"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title="Detailed View"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {PLATFORMS.map((platform) => {
              const count = accounts.filter((a) => a.platform === platform).length
              return (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 whitespace-nowrap ${
                    selectedPlatform === platform
                      ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-600"
                  }`}
                >
                  {platform} {count > 0 && `(${count})`}
                </button>
              )
            })}
          </div>
        </div>

        {/* Accounts List */}
        {filteredAccounts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border-2 border-slate-200 dark:border-slate-700">
            <Shield className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">
              No accounts for {selectedPlatform}
            </p>
            <p className="text-slate-500 dark:text-slate-500 mb-6">
              Add your first account to get started
            </p>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Add Account
            </button>
          </div>
        ) : viewMode === "list" ? (
          /* List View - Compact Table */
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 border-b-2 border-indigo-100 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Password
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      2FA
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{account.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-slate-700 dark:text-slate-300">
                            {showPassword[account.id] ? account.password : "••••••••"}
                          </code>
                          <button
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                [account.id]: !showPassword[account.id],
                              })
                            }
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-all"
                          >
                            {showPassword[account.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(account.password, `pwd-${account.id}`)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-all"
                          >
                            {copied === `pwd-${account.id}` ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {account.twoFA ? (
                          <div className="flex items-center gap-2 -my-1">
                            <TOTPDisplay
                              secret={account.twoFA}
                              accountId={account.id}
                              onCopy={copyToClipboard}
                              copied={copied}
                              showSecret={showTwoFASecret[account.id]}
                              onToggleSecret={() =>
                                setShowTwoFASecret({
                                  ...showTwoFASecret,
                                  [account.id]: !showTwoFASecret[account.id],
                                })
                              }
                              compact={true}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {account.telephoneNumber || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => openModal(account)}
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === "detailed" ? (
          /* Detailed View - Large Expanded Cards */
          <div className="space-y-6">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-lg hover:shadow-2xl"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                      {account.email}
                    </h2>
                    {account.telephoneNumber && (
                      <p className="text-base text-slate-600 dark:text-slate-400 font-bold">
                        📱 {account.telephoneNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openModal(account)}
                      className="p-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all hover:scale-110"
                    >
                      <Edit className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all hover:scale-110"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Password */}
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700/50 p-5 rounded-2xl">
                    <span className="text-base font-black text-slate-700 dark:text-slate-300 w-32">
                      Password:
                    </span>
                    <code className="flex-1 text-base font-mono font-bold text-slate-900 dark:text-white">
                      {showPassword[account.id] ? account.password : "••••••••••••"}
                    </code>
                    <button
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          [account.id]: !showPassword[account.id],
                        })
                      }
                      className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all"
                    >
                      {showPassword[account.id] ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(account.password, `pwd-${account.id}`)}
                      className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all"
                    >
                      {copied === `pwd-${account.id}` ? (
                        <Check className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* 2FA */}
                  {account.twoFA && (
                    <TOTPDisplay
                      secret={account.twoFA}
                      accountId={account.id}
                      onCopy={copyToClipboard}
                      copied={copied}
                      showSecret={showTwoFASecret[account.id]}
                      onToggleSecret={() =>
                        setShowTwoFASecret({
                          ...showTwoFASecret,
                          [account.id]: !showTwoFASecret[account.id],
                        })
                      }
                    />
                  )}

                  {/* Notes */}
                  {account.notes && (
                    <div className="text-base text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-5 rounded-2xl">
                      <span className="font-black">Notes: </span>
                      {account.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Card View - Medium Size (Default) */
          <div className="space-y-4">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                      {account.email}
                    </h3>
                    {account.telephoneNumber && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        📱 {account.telephoneNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(account)}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Password */}
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 w-24">
                      Password:
                    </span>
                    <code className="flex-1 text-sm font-mono text-slate-900 dark:text-white">
                      {showPassword[account.id] ? account.password : "••••••••••"}
                    </code>
                    <button
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          [account.id]: !showPassword[account.id],
                        })
                      }
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-all"
                    >
                      {showPassword[account.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(account.password, `pwd-${account.id}`)}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-all"
                    >
                      {copied === `pwd-${account.id}` ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* 2FA */}
                  {account.twoFA && (
                    <TOTPDisplay
                      secret={account.twoFA}
                      accountId={account.id}
                      onCopy={copyToClipboard}
                      copied={copied}
                      showSecret={showTwoFASecret[account.id]}
                      onToggleSecret={() =>
                        setShowTwoFASecret({
                          ...showTwoFASecret,
                          [account.id]: !showTwoFASecret[account.id],
                        })
                      }
                    />
                  )}

                  {/* Notes */}
                  {account.notes && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                      <span className="font-bold">Notes: </span>
                      {account.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-indigo-100 dark:border-slate-700 animate-scaleIn">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 border-b-2 border-indigo-100 dark:border-slate-700 px-6 py-5 flex items-center justify-between backdrop-blur-sm z-10">
              <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {editingAccount ? "Edit Account" : "Add New Account"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-700"
                    required
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    2FA Secret Key (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.twoFA}
                    onChange={(e) => setFormData({ ...formData, twoFA: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-amber-200 dark:border-amber-800 rounded-xl focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-amber-50 dark:bg-amber-900/20"
                    placeholder="Enter 2FA secret key for authenticator app"
                  />
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    This is the secret key used to generate 2FA codes. Scan the QR code below with your authenticator app.
                  </p>
                  {qrCodeUrl && (
                    <div className="mt-4 p-4 bg-white dark:bg-slate-700 rounded-xl border-2 border-amber-200 dark:border-amber-800 text-center">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                        Scan with authenticator app:
                      </p>
                      <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto rounded-lg" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.telephoneNumber}
                    onChange={(e) => setFormData({ ...formData, telephoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-700"
                    rows={3}
                    placeholder="Any additional notes about this account..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-bold hover:scale-105"
                >
                  {editingAccount ? "Update Account" : "Add Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full border-2 border-indigo-100 dark:border-slate-700 animate-scaleIn">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 border-b-2 border-indigo-100 dark:border-slate-700 px-6 py-5 flex items-center justify-between">
              <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Bulk Import Accounts
              </h2>
              <button
                onClick={() => {
                  setIsBulkModalOpen(false)
                  setBulkText("")
                }}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Platform for all accounts
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-700"
                >
                  {PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Account Data
                </label>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-mono text-sm bg-white dark:bg-slate-700"
                  rows={12}
                  placeholder="email:password:2fa:phone&#10;example@mail.com:pass123:ABC123XYZ:+1234567890&#10;another@mail.com:pass456:DEF456UVW:+0987654321"
                />
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  Format: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">email:password:2fa:phone</code>
                  <br />
                  One account per line. 2FA and phone are optional (leave empty with :).
                </p>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsBulkModalOpen(false)
                    setBulkText("")
                  }}
                  className="px-8 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-bold hover:scale-105"
                >
                  Import Accounts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
