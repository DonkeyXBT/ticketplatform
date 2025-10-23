//
//  SalesManagerView.swift
//  TicketPlatform
//
//  Manage multiple sales per ticket
//

import SwiftUI

struct SalesManagerView: View {
    let ticket: Ticket
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel: SalesViewModel
    @State private var showingAddSale = false

    init(ticket: Ticket) {
        self.ticket = ticket
        _viewModel = StateObject(wrappedValue: SalesViewModel(ticketId: ticket.id))
    }

    var body: some View {
        NavigationView {
            ZStack {
                Color.backgroundPrimary.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: Spacing.lg) {
                        // Ticket summary
                        VStack(alignment: .leading, spacing: Spacing.md) {
                            Text(ticket.artist)
                                .font(.headingLarge)
                                .foregroundColor(.textPrimary)

                            Text(ticket.location)
                                .font(.bodyMedium)
                                .foregroundColor(.textSecondary)

                            Divider()

                            // Stats
                            HStack(spacing: Spacing.lg) {
                                StatItem(label: "Total", value: "\(ticket.quantity)")
                                StatItem(label: "Sold", value: "\(ticket.totalSold)", color: .success)
                                StatItem(label: "Remaining", value: "\(ticket.remainingQuantity)", color: .warning)
                            }
                        }
                        .padding(Spacing.md)
                        .background(Color.backgroundSecondary)
                        .cornerRadius(CornerRadius.lg)
                        .padding(.horizontal, Spacing.md)

                        // Sales list
                        if viewModel.sales.isEmpty {
                            EmptyStateView(
                                icon: "cart.fill",
                                title: "No sales yet",
                                message: "Add your first sale to track buyers"
                            )
                        } else {
                            VStack(spacing: Spacing.md) {
                                ForEach(viewModel.sales) { sale in
                                    SaleCard(sale: sale) {
                                        await viewModel.toggleTicketsSent(sale.id)
                                    }
                                }
                            }
                            .padding(.horizontal, Spacing.md)
                        }

                        if ticket.remainingQuantity > 0 {
                            PrimaryButton(
                                title: "Add Sale",
                                icon: "plus.circle.fill"
                            ) {
                                showingAddSale = true
                            }
                            .padding(.horizontal, Spacing.md)
                        }
                    }
                    .padding(.vertical, Spacing.md)
                }
            }
            .navigationTitle("Manage Sales")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(.primaryAmber)
                }
            }
            .sheet(isPresented: $showingAddSale) {
                AddSaleView(
                    ticketId: ticket.id,
                    remainingQuantity: ticket.remainingQuantity
                )
            }
        }
        .task {
            await viewModel.loadSales()
        }
    }
}

// MARK: - Sale Card
struct SaleCard: View {
    let sale: Sale
    let onToggleSent: () async -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            // Buyer info
            HStack {
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text(sale.deliveryName ?? "Unknown Buyer")
                        .font(.headingMedium)
                        .foregroundColor(.textPrimary)

                    if let email = sale.deliveryEmail {
                        Text(email)
                            .font(.bodySmall)
                            .foregroundColor(.textSecondary)
                    }
                }

                Spacer()

                // Sent status badge
                HStack(spacing: Spacing.xs) {
                    Image(systemName: sale.ticketsSent ? "checkmark.circle.fill" : "paperplane")
                    Text(sale.ticketsSent ? "Sent" : "Not Sent")
                }
                .font(.labelSmall)
                .foregroundColor(.white)
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.xs)
                .background(sale.ticketsSent ? Color.success : Color.warning)
                .cornerRadius(CornerRadius.full)
            }

            Divider()

            // Sale details
            VStack(spacing: Spacing.sm) {
                DetailRow(label: "Quantity", value: "\(sale.quantitySold) tickets")

                if let price = sale.salePrice, let currency = sale.sellCurrency {
                    DetailRow(
                        label: "Sale Price",
                        value: "\(Currency(rawValue: currency)?.symbol ?? "$")\(String(format: "%.2f", price))"
                    )
                }

                if let profit = sale.profit {
                    DetailRow(
                        label: "Profit",
                        value: "$\(String(format: "%.2f", profit))",
                        valueColor: profit >= 0 ? .success : .error
                    )
                }

                if let platform = sale.siteSold {
                    DetailRow(label: "Platform", value: platform)
                }
            }

            // Toggle button
            Button(action: {
                Task {
                    await onToggleSent()
                }
            }) {
                HStack {
                    Image(systemName: sale.ticketsSent ? "xmark.circle" : "checkmark.circle")
                    Text(sale.ticketsSent ? "Mark as Not Sent" : "Mark as Sent")
                }
                .font(.labelMedium)
                .foregroundColor(.primaryAmber)
                .frame(maxWidth: .infinity)
                .padding(.vertical, Spacing.sm)
                .background(Color.primaryAmber.opacity(0.1))
                .cornerRadius(CornerRadius.md)
            }
        }
        .padding(Spacing.md)
        .background(Color.backgroundSecondary)
        .cornerRadius(CornerRadius.lg)
    }
}

struct StatItem: View {
    let label: String
    let value: String
    var color: Color = .textPrimary

    var body: some View {
        VStack(spacing: Spacing.xs) {
            Text(value)
                .font(.headingLarge)
                .foregroundColor(color)
            Text(label)
                .font(.bodySmall)
                .foregroundColor(.textMuted)
        }
    }
}

struct DetailRow: View {
    let label: String
    let value: String
    var valueColor: Color = .textPrimary

    var body: some View {
        HStack {
            Text(label)
                .font(.bodyMedium)
                .foregroundColor(.textSecondary)
            Spacer()
            Text(value)
                .font(.bodyMedium)
                .foregroundColor(valueColor)
        }
    }
}

// MARK: - Add Sale View
struct AddSaleView: View {
    let ticketId: String
    let remainingQuantity: Int
    @Environment(\.dismiss) var dismiss

    @State private var quantitySold = 1
    @State private var salePrice = ""
    @State private var currency = "USD"
    @State private var platform = "StubHub"
    @State private var buyerName = ""
    @State private var buyerEmail = ""
    @State private var isLoading = false

    var body: some View {
        NavigationView {
            ZStack {
                Color.backgroundPrimary.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: Spacing.md) {
                        // Quantity stepper
                        VStack(alignment: .leading, spacing: Spacing.sm) {
                            Text("Quantity (\(remainingQuantity) available)")
                                .font(.labelMedium)
                                .foregroundColor(.textSecondary)

                            Stepper(value: $quantitySold, in: 1...remainingQuantity) {
                                Text("\(quantitySold) tickets")
                                    .font(.headingMedium)
                                    .foregroundColor(.textPrimary)
                            }
                            .padding(Spacing.md)
                            .background(Color.backgroundSecondary)
                            .cornerRadius(CornerRadius.md)
                        }

                        // Sale price
                        VStack(alignment: .leading, spacing: Spacing.sm) {
                            Text("Sale Price")
                                .font(.labelMedium)
                                .foregroundColor(.textSecondary)

                            HStack {
                                TextField("0.00", text: $salePrice)
                                    .keyboardType(.decimalPad)
                                    .textFieldStyle(CustomTextFieldStyle())

                                Picker("Currency", selection: $currency) {
                                    ForEach(Currency.allCases.prefix(5), id: \.rawValue) { curr in
                                        Text(curr.rawValue).tag(curr.rawValue)
                                    }
                                }
                                .pickerStyle(MenuPickerStyle())
                                .frame(width: 100)
                            }
                        }

                        // Platform
                        Picker("Platform", selection: $platform) {
                            ForEach(SalePlatform.allCases, id: \.rawValue) { plat in
                                Text(plat.rawValue).tag(plat.rawValue)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        .padding(Spacing.md)
                        .background(Color.backgroundSecondary)
                        .cornerRadius(CornerRadius.md)

                        // Buyer details
                        TextField("Buyer Name", text: $buyerName)
                            .textFieldStyle(CustomTextFieldStyle())

                        TextField("Buyer Email", text: $buyerEmail)
                            .textFieldStyle(CustomTextFieldStyle())
                            .textInputAutocapitalization(.never)
                            .keyboardType(.emailAddress)

                        PrimaryButton(
                            title: "Add Sale",
                            icon: "plus",
                            isLoading: isLoading
                        ) {
                            Task {
                                await saveSale()
                            }
                        }
                        .padding(.top, Spacing.md)
                    }
                    .padding(Spacing.lg)
                }
            }
            .navigationTitle("Add Sale")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.primaryAmber)
                }
            }
        }
    }

    private func saveSale() async {
        isLoading = true

        let request = CreateSaleRequest(
            quantitySold: quantitySold,
            salePrice: Double(salePrice),
            sellCurrency: currency,
            saleId: nil,
            siteSold: platform,
            deliveryEmail: buyerEmail.isEmpty ? nil : buyerEmail,
            deliveryName: buyerName.isEmpty ? nil : buyerName
        )

        do {
            _ = try await APIService.shared.createSale(ticketId: ticketId, request)
            dismiss()
        } catch {
            print("Error: \(error)")
        }

        isLoading = false
    }
}

// MARK: - View Model
@MainActor
class SalesViewModel: ObservableObject {
    @Published var sales: [Sale] = []
    @Published var isLoading = false

    private let ticketId: String

    init(ticketId: String) {
        self.ticketId = ticketId
    }

    func loadSales() async {
        isLoading = true
        do {
            sales = try await APIService.shared.getSales(ticketId: ticketId)
        } catch {
            print("Error loading sales: \(error)")
        }
        isLoading = false
    }

    func toggleTicketsSent(_ saleId: String) async {
        do {
            _ = try await APIService.shared.toggleTicketsSent(saleId: saleId)
            await loadSales()
        } catch {
            print("Error toggling sent status: \(error)")
        }
    }
}
