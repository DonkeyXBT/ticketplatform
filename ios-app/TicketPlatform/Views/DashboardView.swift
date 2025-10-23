//
//  DashboardView.swift
//  TicketPlatform
//
//  Main dashboard with ticket overview and statistics
//

import SwiftUI
import Combine

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @State private var showingAddTicket = false
    @State private var searchText = ""
    @State private var selectedStatus: TicketStatus? = nil
    @State private var viewMode: ViewMode = .card

    enum ViewMode {
        case list, card, detailed
    }

    var body: some View {
        NavigationView {
            ZStack {
                Color.backgroundPrimary.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: Spacing.lg) {
                        // Statistics cards
                        StatisticsView(
                            totalTickets: viewModel.tickets.count,
                            totalRevenue: viewModel.totalRevenue,
                            totalProfit: viewModel.totalProfit
                        )

                        // Search and filters
                        VStack(spacing: Spacing.md) {
                            SearchBar(text: $searchText)

                            // View mode picker
                            Picker("View Mode", selection: $viewMode) {
                                Image(systemName: "list.bullet").tag(ViewMode.list)
                                Image(systemName: "square.grid.2x2").tag(ViewMode.card)
                                Image(systemName: "square.fill.text.grid.1x2").tag(ViewMode.detailed)
                            }
                            .pickerStyle(SegmentedPickerStyle())

                            // Status filter
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: Spacing.sm) {
                                    StatusFilterChip(
                                        title: "All",
                                        isSelected: selectedStatus == nil,
                                        action: { selectedStatus = nil }
                                    )

                                    ForEach([TicketStatus.listed, .pending, .sold], id: \.self) { status in
                                        StatusFilterChip(
                                            title: status.rawValue,
                                            isSelected: selectedStatus == status,
                                            action: { selectedStatus = status }
                                        )
                                    }
                                }
                                .padding(.horizontal, Spacing.md)
                            }
                        }
                        .padding(.horizontal, Spacing.md)

                        // Tickets list
                        if viewModel.isLoading {
                            ProgressView()
                                .padding(.top, Spacing.xxl)
                        } else if filteredTickets.isEmpty {
                            EmptyStateView(
                                icon: "ticket.fill",
                                title: "No tickets yet",
                                message: "Start by adding your first ticket"
                            )
                        } else {
                            ForEach(filteredTickets) { ticket in
                                switch viewMode {
                                case .list:
                                    TicketListRowView(ticket: ticket)
                                case .card:
                                    TicketCardView(ticket: ticket)
                                case .detailed:
                                    TicketDetailedCardView(ticket: ticket)
                                }
                            }
                            .padding(.horizontal, Spacing.md)
                        }
                    }
                    .padding(.vertical, Spacing.md)
                }
            }
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddTicket = true }) {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(LinearGradient.amberGradient)
                            .font(.title2)
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { Task { await viewModel.loadTickets() } }) {
                        Image(systemName: "arrow.clockwise")
                            .foregroundColor(.primaryAmber)
                    }
                }
            }
            .sheet(isPresented: $showingAddTicket) {
                AddTicketView()
            }
        }
        .task {
            await viewModel.loadTickets()
        }
    }

    private var filteredTickets: [Ticket] {
        viewModel.tickets.filter { ticket in
            let matchesSearch = searchText.isEmpty ||
                ticket.artist.localizedCaseInsensitiveContains(searchText) ||
                ticket.location.localizedCaseInsensitiveContains(searchText)

            let matchesStatus = selectedStatus == nil || ticket.status == selectedStatus

            return matchesSearch && matchesStatus
        }
    }
}

// MARK: - View Model
@MainActor
class DashboardViewModel: ObservableObject {
    @Published var tickets: [Ticket] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    var totalRevenue: Double {
        tickets.reduce(0) { $0 + $1.totalRevenue }
    }

    var totalProfit: Double {
        tickets.reduce(0) { $0 + $1.totalProfit }
    }

    func loadTickets() async {
        isLoading = true
        errorMessage = nil

        do {
            tickets = try await APIService.shared.getTickets()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func deleteTicket(_ ticket: Ticket) async {
        do {
            _ = try await APIService.shared.deleteTicket(id: ticket.id)
            tickets.removeAll { $0.id == ticket.id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

#Preview {
    DashboardView()
        .environmentObject(AuthenticationManager())
        .environmentObject(ThemeManager())
}
