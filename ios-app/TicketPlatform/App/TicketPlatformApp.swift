//
//  TicketPlatformApp.swift
//  TicketPlatform
//
//  Professional ticket reselling management for iOS
//

import SwiftUI

@main
struct TicketPlatformApp: App {
    @StateObject private var authManager = AuthenticationManager()
    @StateObject private var themeManager = ThemeManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(themeManager)
                .preferredColorScheme(themeManager.isDarkMode ? .dark : .light)
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var authManager: AuthenticationManager

    var body: some View {
        Group {
            if authManager.isAuthenticated {
                MainTabView()
            } else {
                LoginView()
            }
        }
        .animation(.easeInOut, value: authManager.isAuthenticated)
    }
}
