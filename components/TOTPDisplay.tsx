"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Key } from "lucide-react"
import * as OTPAuth from "otpauth"

interface TOTPDisplayProps {
  secret: string
  accountId: string
  onCopy: (text: string, field: string) => void
  copied: string | null
  showSecret?: boolean
  onToggleSecret?: () => void
  compact?: boolean
}

export default function TOTPDisplay({
  secret,
  accountId,
  onCopy,
  copied,
  showSecret = false,
  onToggleSecret,
  compact = false,
}: TOTPDisplayProps) {
  const [code, setCode] = useState<string>("")
  const [timeRemaining, setTimeRemaining] = useState<number>(30)

  useEffect(() => {
    if (!secret) return

    const generateCode = () => {
      try {
        const totp = new OTPAuth.TOTP({
          issuer: "Ticket Platform",
          label: "Account",
          algorithm: "SHA1",
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(secret),
        })

        const token = totp.generate()
        setCode(token)

        // Calculate time remaining in current period
        const now = Math.floor(Date.now() / 1000)
        const remaining = 30 - (now % 30)
        setTimeRemaining(remaining)
      } catch (error) {
        console.error("Error generating TOTP:", error)
        setCode("ERROR")
      }
    }

    // Generate immediately
    generateCode()

    // Update every second
    const interval = setInterval(() => {
      generateCode()
    }, 1000)

    return () => clearInterval(interval)
  }, [secret])

  if (!secret) return null

  // Compact mode for list view
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {showSecret ? (
          <code className="text-xs font-mono text-amber-900 dark:text-amber-200">
            {secret.slice(0, 12)}...
          </code>
        ) : (
          <>
            <code className="text-sm font-mono font-bold text-amber-900 dark:text-amber-100">
              {code.slice(0, 3)} {code.slice(3)}
            </code>
            <span
              className={`text-xs font-bold ${
                timeRemaining <= 5
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {timeRemaining}s
            </span>
          </>
        )}
        {onToggleSecret && (
          <button
            onClick={onToggleSecret}
            className="p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded transition-all"
            title={showSecret ? "Show live code" : "Show secret key"}
          >
            <Key className="h-3 w-3" />
          </button>
        )}
        <button
          onClick={() => onCopy(showSecret ? secret : code, `2fa-${accountId}`)}
          className="p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded transition-all"
          title={showSecret ? "Copy secret key" : "Copy current code"}
        >
          {copied === `2fa-${accountId}` ? (
            <Check className="h-3 w-3 text-emerald-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
      </div>
    )
  }

  // Regular mode for card and detailed views
  return (
    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">
      <div className="flex-1 min-w-0">
        {showSecret ? (
          <div>
            <code className="text-sm font-mono text-amber-900 dark:text-amber-200">
              {secret}
            </code>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Secret Key
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <code className="text-lg font-mono font-black text-amber-900 dark:text-amber-100 tracking-wide">
              {code.slice(0, 3)} {code.slice(3)}
            </code>
            <div className="flex items-center gap-1.5">
              <div
                className={`text-xs font-bold ${
                  timeRemaining <= 5
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                {timeRemaining}s
              </div>
              <div className="w-10 h-1 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${
                    timeRemaining <= 5
                      ? "bg-rose-500 dark:bg-rose-400"
                      : "bg-amber-600 dark:bg-amber-400"
                  }`}
                  style={{ width: `${(timeRemaining / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {onToggleSecret && (
        <button
          onClick={onToggleSecret}
          className="p-1.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded transition-all flex-shrink-0"
          title={showSecret ? "Show live code" : "Show secret key"}
        >
          <Key className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => onCopy(showSecret ? secret : code, `2fa-${accountId}`)}
        className="p-1.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded transition-all flex-shrink-0"
        title={showSecret ? "Copy secret key" : "Copy current code"}
      >
        {copied === `2fa-${accountId}` ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}
