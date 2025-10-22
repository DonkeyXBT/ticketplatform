import { AlertCircle, CheckCircle, XCircle, ExternalLink } from "lucide-react"

async function getConfigStatus() {
  const checks = {
    database: !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("user:password@host"),
    nextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthSecret: !!process.env.NEXTAUTH_SECRET && !process.env.NEXTAUTH_SECRET.includes("change-this"),
    discordClientId: !!process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_ID !== "",
    discordClientSecret: !!process.env.DISCORD_CLIENT_SECRET && process.env.DISCORD_CLIENT_SECRET !== "",
  }

  return checks
}

export default async function SetupPage() {
  const checks = await getConfigStatus()
  const allConfigured = Object.values(checks).every(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            {allConfigured ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <AlertCircle className="h-16 w-16 text-yellow-500" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            {allConfigured ? "Configuration Complete! 🎉" : "Configuration Required ⚙️"}
          </h1>

          <p className="text-center text-gray-600 mb-8">
            {allConfigured
              ? "All environment variables are properly configured."
              : "Some environment variables need to be configured before you can use the app."}
          </p>

          <div className="space-y-4 mb-8">
            <ConfigCheck
              label="Neon Database"
              isConfigured={checks.database}
              docs="NEON_DATABASE_SETUP.md"
            />
            <ConfigCheck
              label="NextAuth URL"
              isConfigured={checks.nextAuthUrl}
              docs="SETUP.md"
            />
            <ConfigCheck
              label="NextAuth Secret"
              isConfigured={checks.nextAuthSecret}
              docs="SETUP.md"
            />
            <ConfigCheck
              label="Discord Client ID"
              isConfigured={checks.discordClientId}
              docs="DISCORD_SETUP.md"
            />
            <ConfigCheck
              label="Discord Client Secret"
              isConfigured={checks.discordClientSecret}
              docs="DISCORD_SETUP.md"
            />
          </div>

          {!allConfigured && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                Setup Instructions
              </h3>
              <div className="space-y-3 text-sm text-yellow-700">
                <p className="font-medium">You're seeing this because environment variables aren't configured.</p>

                <div className="bg-white rounded p-4 space-y-2">
                  <p className="font-semibold text-gray-900">For Vercel Deployment:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700">
                    <li>Go to Vercel Dashboard</li>
                    <li>Select your project: ticketplatform</li>
                    <li>Go to Settings → Environment Variables</li>
                    <li>Add all 5 environment variables</li>
                    <li>Redeploy your application</li>
                  </ol>
                  <a
                    href="https://github.com/DonkeyXBT/ticketplatform/blob/main/VERCEL_SETUP.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Read detailed setup guide
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>

                <div className="bg-white rounded p-4 space-y-2">
                  <p className="font-semibold text-gray-900">For Local Development:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700">
                    <li>Update your .env file with real values</li>
                    <li>Run: npx prisma db push</li>
                    <li>Run: npm run dev</li>
                    <li>Open: http://localhost:3000</li>
                  </ol>
                  <a
                    href="https://github.com/DonkeyXBT/ticketplatform/blob/main/CHECKLIST.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-2"
                  >
                    View setup checklist
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {allConfigured ? (
            <div className="text-center">
              <a
                href="/login"
                className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-md"
              >
                Go to Login Page
              </a>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                After configuring all variables, refresh this page to verify.
              </p>
              <a
                href="/setup"
                className="inline-block bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition"
              >
                Refresh to Check Again
              </a>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://github.com/DonkeyXBT/ticketplatform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-200 transition inline-flex items-center"
          >
            View on GitHub
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

function ConfigCheck({ label, isConfigured, docs }: { label: string; isConfigured: boolean; docs: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        {isConfigured ? (
          <CheckCircle className="h-6 w-6 text-green-500" />
        ) : (
          <XCircle className="h-6 w-6 text-red-500" />
        )}
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-semibold ${isConfigured ? "text-green-600" : "text-red-600"}`}>
          {isConfigured ? "Configured" : "Missing"}
        </span>
        {!isConfigured && (
          <a
            href={`https://github.com/DonkeyXBT/ticketplatform/blob/main/${docs}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Docs
          </a>
        )}
      </div>
    </div>
  )
}
