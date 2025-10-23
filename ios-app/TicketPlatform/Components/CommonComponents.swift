//
//  CommonComponents.swift
//  TicketPlatform
//
//  Reusable UI components
//

import SwiftUI

// MARK: - Statistics View
struct StatisticsView: View {
    let totalTickets: Int
    let totalRevenue: Double
    let totalProfit: Double

    var body: some View {
        HStack(spacing: Spacing.md) {
            StatCard(
                title: "Total Tickets",
                value: "\(totalTickets)",
                icon: "ticket.fill",
                color: .statusListed
            )

            StatCard(
                title: "Revenue",
                value: "$\(String(format: "%.0f", totalRevenue))",
                icon: "dollarsign.circle.fill",
                color: .success
            )

            StatCard(
                title: "Profit",
                value: "$\(String(format: "%.0f", totalProfit))",
                icon: "chart.line.uptrend.xyaxis.circle.fill",
                color: totalProfit >= 0 ? .success : .error
            )
        }
        .padding(.horizontal, Spacing.md)
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Spacer()
            }

            Text(value)
                .font(.displaySmall)
                .foregroundColor(.textPrimary)

            Text(title)
                .font(.bodySmall)
                .foregroundColor(.textSecondary)
        }
        .padding(Spacing.md)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.backgroundSecondary)
        .cornerRadius(CornerRadius.lg)
    }
}

// MARK: - Search Bar
struct SearchBar: View {
    @Binding var text: String

    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.textMuted)

            TextField("Search tickets...", text: $text)
                .foregroundColor(.textPrimary)

            if !text.isEmpty {
                Button(action: { text = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.textMuted)
                }
            }
        }
        .padding(Spacing.md)
        .background(Color.backgroundSecondary)
        .cornerRadius(CornerRadius.md)
    }
}

// MARK: - Status Filter Chip
struct StatusFilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.labelSmall)
                .foregroundColor(isSelected ? .white : .textSecondary)
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.sm)
                .background(isSelected ? LinearGradient.amberGradient : Color.backgroundSecondary)
                .cornerRadius(CornerRadius.full)
        }
    }
}

// MARK: - Empty State View
struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: Spacing.lg) {
            Image(systemName: icon)
                .font(.system(size: 64))
                .foregroundStyle(LinearGradient.amberGradient)

            VStack(spacing: Spacing.sm) {
                Text(title)
                    .font(.headingLarge)
                    .foregroundColor(.textPrimary)

                Text(message)
                    .font(.bodyMedium)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(Spacing.xxl)
    }
}

// MARK: - Loading Overlay
struct LoadingOverlay: View {
    let message: String?

    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()

            VStack(spacing: Spacing.md) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .primaryAmber))
                    .scaleEffect(1.5)

                if let message = message {
                    Text(message)
                        .font(.bodyMedium)
                        .foregroundColor(.textPrimary)
                }
            }
            .padding(Spacing.xl)
            .background(Color.backgroundSecondary)
            .cornerRadius(CornerRadius.lg)
        }
    }
}

// MARK: - Error Banner
struct ErrorBanner: View {
    let message: String
    let onDismiss: () -> Void

    var body: some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.error)

            Text(message)
                .font(.bodySmall)
                .foregroundColor(.textPrimary)

            Spacer()

            Button(action: onDismiss) {
                Image(systemName: "xmark")
                    .foregroundColor(.textMuted)
            }
        }
        .padding(Spacing.md)
        .background(Color.error.opacity(0.2))
        .cornerRadius(CornerRadius.md)
        .padding(.horizontal, Spacing.md)
    }
}

// MARK: - Primary Button
struct PrimaryButton: View {
    let title: String
    let icon: String?
    let isLoading: Bool
    let action: () -> Void

    init(
        title: String,
        icon: String? = nil,
        isLoading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.isLoading = isLoading
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    if let icon = icon {
                        Image(systemName: icon)
                    }
                    Text(title)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .font(.headingMedium)
            .foregroundColor(.white)
            .background(LinearGradient.amberGradient)
            .cornerRadius(CornerRadius.md)
        }
        .disabled(isLoading)
    }
}

// MARK: - Secondary Button
struct SecondaryButton: View {
    let title: String
    let icon: String?
    let action: () -> Void

    init(
        title: String,
        icon: String? = nil,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack {
                if let icon = icon {
                    Image(systemName: icon)
                }
                Text(title)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .font(.headingMedium)
            .foregroundColor(.primaryAmber)
            .background(Color.backgroundSecondary)
            .cornerRadius(CornerRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.md)
                    .stroke(Color.primaryAmber, lineWidth: 2)
            )
        }
    }
}

// MARK: - Section Header
struct SectionHeader: View {
    let title: String
    let action: (() -> Void)?
    let actionTitle: String?

    init(
        title: String,
        action: (() -> Void)? = nil,
        actionTitle: String? = nil
    ) {
        self.title = title
        self.action = action
        self.actionTitle = actionTitle
    }

    var body: some View {
        HStack {
            Text(title)
                .font(.headingLarge)
                .foregroundColor(.textPrimary)

            Spacer()

            if let action = action, let actionTitle = actionTitle {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.labelMedium)
                        .foregroundColor(.primaryAmber)
                }
            }
        }
        .padding(.horizontal, Spacing.md)
    }
}

#Preview {
    ZStack {
        Color.backgroundPrimary.ignoresSafeArea()

        VStack(spacing: Spacing.lg) {
            StatisticsView(
                totalTickets: 24,
                totalRevenue: 15420.50,
                totalProfit: 3250.75
            )

            SearchBar(text: .constant(""))

            EmptyStateView(
                icon: "ticket.fill",
                title: "No tickets yet",
                message: "Start by adding your first ticket"
            )

            PrimaryButton(title: "Add Ticket", icon: "plus") { }

            SecondaryButton(title: "Cancel", icon: "xmark") { }
        }
        .padding()
    }
}
