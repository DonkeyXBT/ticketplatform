//
//  MainTabView.swift
//  TicketPlatform
//
//  Main tab navigation matching web app structure
//

import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // Dashboard
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "square.grid.2x2.fill")
                }
                .tag(0)

            // Events
            EventsView()
                .tabItem {
                    Label("Events", systemImage: "calendar")
                }
                .tag(1)

            // Accounts
            AccountsView()
                .tabItem {
                    Label("Accounts", systemImage: "person.2.fill")
                }
                .tag(2)

            // Profile
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.circle.fill")
                }
                .tag(3)
        }
        .accentColor(.primaryAmber)
        .onAppear {
            // Customize tab bar appearance
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor(Color.backgroundSecondary)

            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthenticationManager())
        .environmentObject(ThemeManager())
}
