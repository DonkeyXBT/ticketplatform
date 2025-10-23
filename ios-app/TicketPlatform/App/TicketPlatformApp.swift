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
