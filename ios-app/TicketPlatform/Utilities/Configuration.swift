//
//  Configuration.swift
//  TicketPlatform
//
//  Simple configuration - defaults to localhost for easy testing
//

import Foundation

struct Configuration {

    /// API Base URL - connects to your Next.js backend
    /// The backend then connects to your Neon database
    ///
    /// IMPORTANT: iOS apps cannot connect directly to PostgreSQL!
    /// They must go through an API (your Next.js backend)
    ///
    /// Default: localhost:3000
    /// Just run "npm run dev" in your backend and this will work!
    static var apiBaseURL: String {
        // Use environment variable if set, otherwise localhost
        if let envURL = ProcessInfo.processInfo.environment["API_BASE_URL"] {
            return envURL
        }

        // Default to localhost for easy local testing
        // Your backend running "npm run dev" will be at localhost:3000
        return "http://localhost:3000"
    }

    // MARK: - App Information

    static var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    }

    static var buildNumber: String {
        Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }

    static var isDebug: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }

    // MARK: - Debug Logging

    static func printConfiguration() {
        print("""
        ========================================
        📱 Ticket Platform
        ========================================
        API URL: \(apiBaseURL)
        Version: \(appVersion) (\(buildNumber))
        ========================================

        ⚠️  Make sure your backend is running:
        cd ticketplatform && npm run dev
        ========================================
        """)
    }
}

/*

 HOW THIS WORKS:

 iOS App → http://localhost:3000 → Next.js API → Neon Database

 Setup:
 1. In terminal: cd ticketplatform && npm run dev
 2. In Xcode: Press Cmd+R to run the app
 3. App connects to localhost:3000 automatically!

 The backend handles all database communication.
 iOS app just makes HTTP requests to the API.

 */
