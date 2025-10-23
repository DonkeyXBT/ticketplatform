//
//  Configuration.swift
//  TicketPlatform
//
//  Environment configuration for different deployment environments
//

import Foundation

enum Environment {
    case development
    case production

    static var current: Environment {
        #if DEBUG
        return .development
        #else
        return .production
        #endif
    }
}

struct Configuration {

    // MARK: - API Configuration

    /// Base URL for API requests
    /// Priority:
    /// 1. Environment variable API_BASE_URL (set in Xcode scheme)
    /// 2. Build configuration (Debug vs Release)
    static var apiBaseURL: String {
        // First check for environment variable (allows override)
        if let envURL = ProcessInfo.processInfo.environment["API_BASE_URL"] {
            return envURL
        }

        // Fall back to build configuration
        switch Environment.current {
        case .development:
            // For development, use this default
            // IMPORTANT: Replace with your Mac's IP address!
            // Find it with: ifconfig | grep "inet " | grep -v 127.0.0.1
            return "http://192.168.1.100:3000"

        case .production:
            // For production builds (TestFlight, App Store)
            // Replace with your Vercel deployment URL
            return "https://ticketplatform.vercel.app"
        }
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

    // MARK: - Helper Methods

    /// Print current configuration (useful for debugging)
    static func printConfiguration() {
        print("""
        ========================================
        📱 Ticket Platform Configuration
        ========================================
        Environment: \(Environment.current == .development ? "Development" : "Production")
        API Base URL: \(apiBaseURL)
        App Version: \(appVersion) (\(buildNumber))
        Debug Mode: \(isDebug)
        ========================================
        """)
    }
}

// MARK: - How to Configure

/*

 ## Development Setup (Local Testing)

 1. Update the development URL in this file:
    - Find your Mac's IP: ifconfig | grep "inet " | grep -v 127.0.0.1
    - Update line 32: return "http://YOUR_MAC_IP:3000"

 2. Make sure backend is running:
    cd ticketplatform
    npm run dev

 3. Run the app in Xcode (Debug configuration is default)


 ## Production Setup (TestFlight/App Store)

 1. Update the production URL in this file:
    - Update line 39: return "https://your-domain.vercel.app"

 2. Archive the app:
    - Product → Archive
    - This automatically uses Release configuration


 ## Environment Variable Override (Optional)

 You can override the URL without changing code:

 1. In Xcode: Product → Scheme → Edit Scheme
 2. Select "Run" on the left
 3. Go to "Arguments" tab
 4. Under "Environment Variables", click +
 5. Add:
    Name: API_BASE_URL
    Value: http://your-custom-url:3000

 This is useful for:
 - Testing against staging server
 - Using a different local IP
 - Testing production API from simulator

 */
