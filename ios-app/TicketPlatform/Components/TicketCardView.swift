//
//  TicketCardView.swift
//  TicketPlatform
//
//  Ticket card component matching web design
//

import SwiftUI

struct TicketCardView: View {
    let ticket: Ticket
    @State private var showingSalesManager = false

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text(ticket.artist)
                        .font(.headingLarge)
                        .foregroundColor(.textPrimary)

                    HStack(spacing: Spacing.xs) {
                        Image(systemName: "location.fill")
                            .font(.caption)
                        Text(ticket.location)
                            .font(.bodySmall)
                    }
                    .foregroundColor(.textSecondary)
                }

                Spacer()

                StatusBadge(status: ticket.status)
            }

            Divider()
                .background(Color.textMuted.opacity(0.3))

            // Event details
            HStack(spacing: Spacing.lg) {
                DetailItem(
                    icon: "calendar",
                    title: "Date",
                    value: ticket.eventDate.formatted(date: .abbreviated, time: .omitted)
                )

                if let section = ticket.section {
                    DetailItem(
                        icon: "location.square",
                        title: "Section",
                        value: section
                    )
                }

                DetailItem(
                    icon: "ticket",
                    title: "Quantity",
                    value: "\(ticket.totalSold)/\(ticket.quantity)"
                )
            }

            // Financial info
            HStack(spacing: Spacing.lg) {
                if let buyPrice = ticket.buyInPrice {
                    FinancialItem(
                        label: "Buy Price",
                        value: buyPrice,
                        currency: ticket.buyCurrency ?? "USD",
                        color: .textSecondary
                    )
                }

                FinancialItem(
                    label: "Revenue",
                    value: ticket.totalRevenue,
                    currency: ticket.buyCurrency ?? "USD",
                    color: .success
                )

                FinancialItem(
                    label: "Profit",
                    value: ticket.totalProfit,
                    currency: ticket.buyCurrency ?? "USD",
                    color: ticket.totalProfit >= 0 ? .success : .error
                )
            }

            // Actions
            HStack(spacing: Spacing.sm) {
                Button(action: { showingSalesManager = true }) {
                    Label("Sales", systemImage: "cart.fill")
                        .font(.labelSmall)
                        .foregroundColor(.white)
                        .padding(.horizontal, Spacing.md)
                        .padding(.vertical, Spacing.sm)
                        .background(LinearGradient.amberGradient)
                        .cornerRadius(CornerRadius.sm)
                }

                if ticket.remainingQuantity > 0 {
                    Text("\(ticket.remainingQuantity) left")
                        .font(.labelSmall)
                        .foregroundColor(.warning)
                        .padding(.horizontal, Spacing.md)
                        .padding(.vertical, Spacing.sm)
                        .background(Color.warning.opacity(0.1))
                        .cornerRadius(CornerRadius.sm)
                }
            }
        }
        .padding(Spacing.md)
        .background(Color.backgroundSecondary)
        .cornerRadius(CornerRadius.lg)
        .shadow(color: Color.black.opacity(0.2), radius: 10, x: 0, y: 4)
        .sheet(isPresented: $showingSalesManager) {
            SalesManagerView(ticket: ticket)
        }
    }
}

// MARK: - List Row View
struct TicketListRowView: View {
    let ticket: Ticket

    var body: some View {
        HStack(spacing: Spacing.md) {
            // Status indicator
            Circle()
                .fill(statusColor)
                .frame(width: 8, height: 8)

            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text(ticket.artist)
                    .font(.headingSmall)
                    .foregroundColor(.textPrimary)

                Text(ticket.location)
                    .font(.bodySmall)
                    .foregroundColor(.textSecondary)
            }

            Spacer()

            Text("\(ticket.totalSold)/\(ticket.quantity)")
                .font(.labelSmall)
                .foregroundColor(.textSecondary)

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.textMuted)
        }
        .padding(Spacing.md)
        .background(Color.backgroundSecondary)
        .cornerRadius(CornerRadius.md)
    }

    private var statusColor: Color {
        switch ticket.status {
        case .listed: return .statusListed
        case .pending: return .statusPending
        case .sold: return .statusSold
        }
    }
}

// MARK: - Detailed Card View
struct TicketDetailedCardView: View {
    let ticket: Ticket
    @State private var showingSalesManager = false

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            // Full card with all details
            VStack(alignment: .leading, spacing: Spacing.md) {
                // Header
                HStack {
                    Image(systemName: "ticket.fill")
                        .font(.title)
                        .foregroundStyle(LinearGradient.amberGradient)

                    VStack(alignment: .leading) {
                        Text(ticket.artist)
                            .font(.headingLarge)
                            .foregroundColor(.textPrimary)

                        Text(ticket.location)
                            .font(.bodyMedium)
                            .foregroundColor(.textSecondary)
                    }

                    Spacer()

                    StatusBadge(status: ticket.status)
                }

                Divider()

                // Event details grid
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: Spacing.md) {
                    DetailItem(icon: "calendar", title: "Date", value: ticket.eventDate.formatted(date: .abbreviated, time: .shortened))
                    if let section = ticket.section {
                        DetailItem(icon: "location.square", title: "Section", value: section)
                    }
                    if let row = ticket.row {
                        DetailItem(icon: "tablecells", title: "Row", value: row)
                    }
                    if let seat = ticket.seat {
                        DetailItem(icon: "chair", title: "Seat", value: seat)
                    }
                }

                Divider()

                // Financial summary
                VStack(spacing: Spacing.sm) {
                    FinancialRow(label: "Quantity", value: "\(ticket.quantity) tickets")
                    FinancialRow(label: "Sold", value: "\(ticket.totalSold) tickets")
                    FinancialRow(label: "Remaining", value: "\(ticket.remainingQuantity) tickets")

                    if let buyPrice = ticket.buyInPrice, let currency = ticket.buyCurrency {
                        FinancialRow(
                            label: "Total Buy-In",
                            value: formatCurrency(buyPrice, currency: currency),
                            valueColor: .textSecondary
                        )
                    }

                    FinancialRow(
                        label: "Total Revenue",
                        value: formatCurrency(ticket.totalRevenue, currency: ticket.buyCurrency ?? "USD"),
                        valueColor: .success
                    )

                    FinancialRow(
                        label: "Total Profit",
                        value: formatCurrency(ticket.totalProfit, currency: ticket.buyCurrency ?? "USD"),
                        valueColor: ticket.totalProfit >= 0 ? .success : .error,
                        isBold: true
                    )
                }

                // Sales list
                if !ticket.sales.isEmpty {
                    Divider()

                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        Text("Sales (\(ticket.sales.count))")
                            .font(.headingSmall)
                            .foregroundColor(.textPrimary)

                        ForEach(ticket.sales.prefix(3)) { sale in
                            SaleRowView(sale: sale)
                        }
                    }
                }

                // Manage sales button
                Button(action: { showingSalesManager = true }) {
                    Label("Manage Sales", systemImage: "cart.fill")
                        .font(.headingSmall)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Spacing.md)
                        .background(LinearGradient.amberGradient)
                        .cornerRadius(CornerRadius.md)
                }
            }
            .padding(Spacing.lg)
            .background(Color.backgroundSecondary)
            .cornerRadius(CornerRadius.xl)
            .shadow(color: Color.black.opacity(0.3), radius: 15, x: 0, y: 5)
        }
        .sheet(isPresented: $showingSalesManager) {
            SalesManagerView(ticket: ticket)
        }
    }

    private func formatCurrency(_ value: Double, currency: String) -> String {
        let symbol = Currency(rawValue: currency)?.symbol ?? "$"
        return "\(symbol)\(String(format: "%.2f", value))"
    }
}

// MARK: - Helper Views
struct StatusBadge: View {
    let status: TicketStatus

    var body: some View {
        Text(status.rawValue)
            .font(.labelSmall)
            .foregroundColor(.white)
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.xs)
            .background(backgroundColor)
            .cornerRadius(CornerRadius.full)
    }

    private var backgroundColor: Color {
        switch status {
        case .listed: return .statusListed
        case .pending: return .statusPending
        case .sold: return .statusSold
        }
    }
}

struct DetailItem: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        HStack(spacing: Spacing.xs) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(.primaryAmber)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.bodySmall)
                    .foregroundColor(.textMuted)
                Text(value)
                    .font(.labelSmall)
                    .foregroundColor(.textPrimary)
            }
        }
    }
}

struct FinancialItem: View {
    let label: String
    let value: Double
    let currency: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text(label)
                .font(.bodySmall)
                .foregroundColor(.textMuted)

            Text("\(Currency(rawValue: currency)?.symbol ?? "$")\(String(format: "%.2f", value))")
                .font(.labelMedium)
                .foregroundColor(color)
        }
    }
}

struct FinancialRow: View {
    let label: String
    let value: String
    var valueColor: Color = .textPrimary
    var isBold: Bool = false

    var body: some View {
        HStack {
            Text(label)
                .font(isBold ? .headingSmall : .bodyMedium)
                .foregroundColor(.textSecondary)
            Spacer()
            Text(value)
                .font(isBold ? .headingMedium : .bodyMedium)
                .foregroundColor(valueColor)
        }
    }
}

struct SaleRowView: View {
    let sale: Sale

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text(sale.deliveryName ?? "Unknown buyer")
                    .font(.labelSmall)
                    .foregroundColor(.textPrimary)

                Text("\(sale.quantitySold) tickets")
                    .font(.bodySmall)
                    .foregroundColor(.textSecondary)
            }

            Spacer()

            if sale.ticketsSent {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.success)
            }
        }
        .padding(Spacing.sm)
        .background(Color.backgroundTertiary.opacity(0.5))
        .cornerRadius(CornerRadius.sm)
    }
}

#Preview {
    ScrollView {
        VStack(spacing: Spacing.md) {
            TicketCardView(ticket: Ticket(
                id: "1",
                userId: "1",
                artist: "Taylor Swift",
                location: "Wembley Stadium",
                eventDate: Date(),
                section: "A1",
                row: "10",
                seat: "15-20",
                quantity: 6,
                buyInPrice: 300,
                buyCurrency: "EUR",
                boughtFrom: "Ticketmaster",
                status: .pending,
                orderNumber: "TM12345",
                emailUsed: "test@example.com",
                createdAt: Date(),
                updatedAt: Date(),
                totalSold: 4,
                remainingQuantity: 2,
                totalRevenue: 450,
                totalProfit: 150,
                sales: []
            ))
        }
        .padding()
        .background(Color.backgroundPrimary)
    }
}
