//
//  EventsView.swift
//  TicketPlatform
//
//  Calendar view of upcoming events
//

import SwiftUI

struct EventsView: View {
    @StateObject private var viewModel = EventsViewModel()

    var body: some View {
        NavigationView {
            ZStack {
                Color.backgroundPrimary.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: Spacing.lg) {
                        if viewModel.upcomingEvents.isEmpty {
                            EmptyStateView(
                                icon: "calendar",
                                title: "No upcoming events",
                                message: "Your events will appear here"
                            )
                        } else {
                            ForEach(viewModel.upcomingEvents) { event in
                                EventCard(event: event)
                            }
                            .padding(.horizontal, Spacing.md)
                        }
                    }
                    .padding(.vertical, Spacing.md)
                }
            }
            .navigationTitle("Events")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { Task { await viewModel.loadEvents() } }) {
                        Image(systemName: "arrow.clockwise")
                            .foregroundColor(.primaryAmber)
                    }
                }
            }
        }
        .task {
            await viewModel.loadEvents()
        }
    }
}

struct EventCard: View {
    let event: Ticket

    var body: some View {
        HStack(spacing: Spacing.md) {
            // Date badge
            VStack(spacing: Spacing.xs) {
                Text(event.eventDate.formatted(.dateTime.month(.abbreviated)))
                    .font(.labelSmall)
                    .foregroundColor(.textMuted)

                Text(event.eventDate.formatted(.dateTime.day()))
                    .font(.displayMedium)
                    .foregroundColor(.primaryAmber)

                Text(event.eventDate.formatted(.dateTime.year()))
                    .font(.bodySmall)
                    .foregroundColor(.textMuted)
            }
            .frame(width: 70)
            .padding(.vertical, Spacing.md)
            .background(Color.backgroundTertiary)
            .cornerRadius(CornerRadius.md)

            // Event details
            VStack(alignment: .leading, spacing: Spacing.sm) {
                Text(event.artist)
                    .font(.headingMedium)
                    .foregroundColor(.textPrimary)

                HStack(spacing: Spacing.xs) {
                    Image(systemName: "location.fill")
                        .font(.caption)
                    Text(event.location)
                        .font(.bodySmall)
                }
                .foregroundColor(.textSecondary)

                HStack(spacing: Spacing.xs) {
                    Image(systemName: "clock.fill")
                        .font(.caption)
                    Text(event.eventDate.formatted(.dateTime.hour().minute()))
                        .font(.bodySmall)
                }
                .foregroundColor(.textSecondary)

                HStack(spacing: Spacing.sm) {
                    StatusBadge(status: event.status)

                    Text("\(event.totalSold)/\(event.quantity) sold")
                        .font(.labelSmall)
                        .foregroundColor(.textMuted)
                }
            }

            Spacer()
        }
        .padding(Spacing.md)
        .background(Color.backgroundSecondary)
        .cornerRadius(CornerRadius.lg)
    }
}

@MainActor
class EventsViewModel: ObservableObject {
    @Published var upcomingEvents: [Ticket] = []
    @Published var isLoading = false

    func loadEvents() async {
        isLoading = true

        do {
            let allTickets = try await APIService.shared.getTickets()
            // Filter to upcoming events only
            upcomingEvents = allTickets
                .filter { $0.eventDate > Date() }
                .sorted { $0.eventDate < $1.eventDate }
        } catch {
            print("Error loading events: \(error)")
        }

        isLoading = false
    }
}
