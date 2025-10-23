//
//  ThemeManager.swift
//  TicketPlatform
//
//  Theme management matching the web app's design system
//

import SwiftUI
import Combine

class ThemeManager: ObservableObject {
    @Published var isDarkMode: Bool = true
}

// MARK: - Colors
extension Color {
    // Amber theme colors (matching web app)
    static let primaryAmber = Color(hex: "#F59E0B")
    static let amberLight = Color(hex: "#FEF3C7")
    static let amberDark = Color(hex: "#92400E")

    // Gradient colors
    static let gradientStart = Color(hex: "#F59E0B")
    static let gradientEnd = Color(hex: "#EF4444")

    // Background colors
    static let backgroundPrimary = Color(hex: "#0F172A")
    static let backgroundSecondary = Color(hex: "#1E293B")
    static let backgroundTertiary = Color(hex: "#334155")

    // Text colors
    static let textPrimary = Color.white
    static let textSecondary = Color(hex: "#94A3B8")
    static let textMuted = Color(hex: "#64748B")

    // Status colors
    static let statusListed = Color(hex: "#3B82F6")
    static let statusPending = Color(hex: "#F59E0B")
    static let statusSold = Color(hex: "#10B981")

    // Semantic colors
    static let success = Color(hex: "#10B981")
    static let error = Color(hex: "#EF4444")
    static let warning = Color(hex: "#F59E0B")

    // Helper to create Color from hex
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Gradients
extension LinearGradient {
    static let primaryGradient = LinearGradient(
        gradient: Gradient(colors: [.gradientStart, .gradientEnd]),
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let amberGradient = LinearGradient(
        gradient: Gradient(colors: [Color.primaryAmber, Color(hex: "#FBBF24")]),
        startPoint: .leading,
        endPoint: .trailing
    )
}

// MARK: - Fonts
extension Font {
    static let displayLarge = Font.system(size: 32, weight: .bold)
    static let displayMedium = Font.system(size: 24, weight: .bold)
    static let displaySmall = Font.system(size: 20, weight: .bold)

    static let headingLarge = Font.system(size: 18, weight: .semibold)
    static let headingMedium = Font.system(size: 16, weight: .semibold)
    static let headingSmall = Font.system(size: 14, weight: .semibold)

    static let bodyLarge = Font.system(size: 16, weight: .regular)
    static let bodyMedium = Font.system(size: 14, weight: .regular)
    static let bodySmall = Font.system(size: 12, weight: .regular)

    static let labelMedium = Font.system(size: 14, weight: .medium)
    static let labelSmall = Font.system(size: 12, weight: .medium)
}

// MARK: - Spacing
enum Spacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 16
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
    static let xxl: CGFloat = 48
}

// MARK: - Corner Radius
enum CornerRadius {
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let full: CGFloat = 999
}
