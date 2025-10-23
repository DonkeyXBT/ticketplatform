"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function MobileCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      try {
        // Fetch the JWT token from the mobile-token endpoint
        const response = await fetch("/api/auth/mobile-token")

        if (!response.ok) {
          throw new Error("Failed to get authentication token")
        }

        const data = await response.json()

        if (!data.token) {
          throw new Error("No token received")
        }

        // Redirect to iOS app with the token
        const appUrl = `ticketplatform://auth-callback?token=${encodeURIComponent(data.token)}&user=${encodeURIComponent(JSON.stringify(data.user))}`

        setStatus("success")

        // Try to open the app
        window.location.href = appUrl

        // If the app doesn't open, show success message
        setTimeout(() => {
          // User is still on this page, show instructions
        }, 1000)
      } catch (error) {
        console.error("Mobile callback error:", error)
        setStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Authentication failed")
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {status === "loading" && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Authenticating...
              </h2>
              <p className="text-slate-400">
                Redirecting you to the app
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="text-green-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Success!
              </h2>
              <p className="text-slate-400 mb-4">
                Opening the Ticket Platform app...
              </p>
              <p className="text-sm text-slate-500">
                If the app doesn't open automatically, please return to the app manually.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Authentication Failed
              </h2>
              <p className="text-slate-400 mb-4">{errorMessage}</p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
