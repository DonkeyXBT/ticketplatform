//
//  AddTicketView.swift
//  TicketPlatform
//
//  Add new ticket form
//

import SwiftUI

struct AddTicketView: View {
    @Environment(\.dismiss) var dismiss
    @State private var artist = ""
    @State private var location = ""
    @State private var eventDate = Date()
    @State private var section = ""
    @State private var row = ""
    @State private var seat = ""
    @State private var quantity = 1
    @State private var buyPrice = ""
    @State private var currency = "USD"
    @State private var platform = "Ticketmaster"
    @State private var orderNumber = ""
    @State private var emailUsed = ""
    @State private var isLoading = false

    var body: some View {
        NavigationView {
            ZStack {
                Color.backgroundPrimary.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: Spacing.md) {
                        // Event Details Section
                        SectionHeader(title: "Event Details")

                        TextField("Artist / Event Name", text: $artist)
                            .textFieldStyle(CustomTextFieldStyle())

                        TextField("Location / Venue", text: $location)
                            .textFieldStyle(CustomTextFieldStyle())

                        DatePicker(
                            "Event Date",
                            selection: $eventDate,
                            displayedComponents: [.date, .hourAndMinute]
                        )
                        .padding(Spacing.md)
                        .background(Color.backgroundSecondary)
                        .cornerRadius(CornerRadius.md)
                        .foregroundColor(.textPrimary)

                        // Seating Section
                        SectionHeader(title: "Seating (Optional)")

                        HStack(spacing: Spacing.sm) {
                            TextField("Section", text: $section)
                                .textFieldStyle(CustomTextFieldStyle())

                            TextField("Row", text: $row)
                                .textFieldStyle(CustomTextFieldStyle())

                            TextField("Seat", text: $seat)
                                .textFieldStyle(CustomTextFieldStyle())
                        }

                        // Purchase Details Section
                        SectionHeader(title: "Purchase Details")

                        Stepper(value: $quantity, in: 1...100) {
                            HStack {
                                Text("Quantity")
                                Spacer()
                                Text("\(quantity) tickets")
                                    .foregroundColor(.primaryAmber)
                            }
                        }
                        .padding(Spacing.md)
                        .background(Color.backgroundSecondary)
                        .cornerRadius(CornerRadius.md)

                        HStack {
                            TextField("Buy Price", text: $buyPrice)
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

                        Picker("Platform", selection: $platform) {
                            ForEach(PurchasePlatform.allCases, id: \.rawValue) { plat in
                                Text(plat.rawValue).tag(plat.rawValue)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        .padding(Spacing.md)
                        .background(Color.backgroundSecondary)
                        .cornerRadius(CornerRadius.md)

                        TextField("Order Number (optional)", text: $orderNumber)
                            .textFieldStyle(CustomTextFieldStyle())

                        TextField("Email Used (optional)", text: $emailUsed)
                            .textFieldStyle(CustomTextFieldStyle())
                            .textInputAutocapitalization(.never)
                            .keyboardType(.emailAddress)

                        PrimaryButton(
                            title: "Add Ticket",
                            icon: "plus",
                            isLoading: isLoading
                        ) {
                            Task {
                                await saveTicket()
                            }
                        }
                        .padding(.top, Spacing.md)
                        .disabled(artist.isEmpty || location.isEmpty)
                    }
                    .padding(Spacing.lg)
                }
            }
            .navigationTitle("Add Ticket")
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

    private func saveTicket() async {
        isLoading = true

        let request = CreateTicketRequest(
            artist: artist,
            location: location,
            eventDate: eventDate,
            section: section.isEmpty ? nil : section,
            row: row.isEmpty ? nil : row,
            seat: seat.isEmpty ? nil : seat,
            quantity: quantity,
            buyInPrice: Double(buyPrice),
            buyCurrency: currency,
            boughtFrom: platform,
            orderNumber: orderNumber.isEmpty ? nil : orderNumber,
            emailUsed: emailUsed.isEmpty ? nil : emailUsed
        )

        do {
            _ = try await APIService.shared.createTicket(request)
            dismiss()
        } catch {
            print("Error: \(error)")
        }

        isLoading = false
    }
}
