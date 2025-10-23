//
//  AccountsView.swift
//  TicketPlatform
//
//  Platform accounts management with 2FA codes
//

import SwiftUI

struct AccountsView: View {
    @StateObject private var viewModel = AccountsViewModel()
    @State private var selectedPlatform: String = "All"
    @State private var showingAddAccount = false

    private let platforms = ["All", "Ticketmaster", "AXS", "SeeTickets", "StubHub", "Viagogo", "Other"]

    var body: some View {
        NavigationView {
            ZStack {
                Color.backgroundPrimary.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: Spacing.lg) {
                        // Platform filter
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: Spacing.sm) {
                                ForEach(platforms, id: \.self) { platform in
                                    StatusFilterChip(
                                        title: platform,
                                        isSelected: selectedPlatform == platform,
                                        action: { selectedPlatform = platform }
                                    )
                                }
                            }
                            .padding(.horizontal, Spacing.md)
                        }

                        // Accounts list
                        if viewModel.isLoading {
                            ProgressView()
                                .padding(.top, Spacing.xxl)
                        } else if filteredAccounts.isEmpty {
                            EmptyStateView(
                                icon: "person.2.fill",
                                title: "No accounts yet",
                                message: "Add your platform accounts to manage credentials securely"
                            )
                        } else {
                            ForEach(filteredAccounts) { account in
                                PlatformAccountCard(account: account)
                            }
                            .padding(.horizontal, Spacing.md)
                        }
                    }
                    .padding(.vertical, Spacing.md)
                }
            }
            .navigationTitle("Platform Accounts")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddAccount = true }) {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(LinearGradient.amberGradient)
                            .font(.title2)
                    }
                }
            }
            .sheet(isPresented: $showingAddAccount) {
                AddAccountView()
            }
        }
        .task {
            await viewModel.loadAccounts()
        }
    }

    private var filteredAccounts: [PlatformAccount] {
        if selectedPlatform == "All" {
            return viewModel.accounts
        }
        return viewModel.accounts.filter { $0.platform == selectedPlatform }
    }
}

// MARK: - Platform Account Card
struct PlatformAccountCard: View {
    let account: PlatformAccount
    @State private var showingPassword = false
    @State private var showingSecret = false
    @State private var totpCode: TOTPCode?
    @State private var timer: Timer?

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            // Header
            HStack {
                Image(systemName: "building.2.fill")
                    .font(.title2)
                    .foregroundStyle(LinearGradient.amberGradient)

                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text(account.platform)
                        .font(.headingLarge)
                        .foregroundColor(.textPrimary)

                    Text(account.email)
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)
                }

                Spacer()
            }

            Divider()

            // Credentials
            VStack(alignment: .leading, spacing: Spacing.sm) {
                // Password
                CredentialRow(
                    label: "Password",
                    value: account.password ?? "",
                    isHidden: !showingPassword,
                    onToggle: { showingPassword.toggle() }
                )

                // 2FA Secret
                if let secret = account.twoFactorSecret {
                    CredentialRow(
                        label: "2FA Secret",
                        value: secret,
                        isHidden: !showingSecret,
                        onToggle: { showingSecret.toggle() }
                    )

                    // TOTP Code Display
                    if !showingSecret {
                        TOTPCodeView(secret: secret)
                    }
                }

                // Phone number
                if let phone = account.phoneNumber {
                    HStack {
                        Text("Phone")
                            .font(.labelSmall)
                            .foregroundColor(.textMuted)
                        Spacer()
                        Text(phone)
                            .font(.bodySmall)
                            .foregroundColor(.textPrimary)
                    }
                }

                // Notes
                if let notes = account.notes, !notes.isEmpty {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Text("Notes")
                            .font(.labelSmall)
                            .foregroundColor(.textMuted)
                        Text(notes)
                            .font(.bodySmall)
                            .foregroundColor(.textPrimary)
                    }
                }
            }
        }
        .padding(Spacing.md)
        .background(Color.backgroundSecondary)
        .cornerRadius(CornerRadius.lg)
        .shadow(color: Color.black.opacity(0.2), radius: 10, x: 0, y: 4)
    }
}

// MARK: - Credential Row
struct CredentialRow: View {
    let label: String
    let value: String
    let isHidden: Bool
    let onToggle: () -> Void

    var body: some View {
        HStack {
            Text(label)
                .font(.labelSmall)
                .foregroundColor(.textMuted)

            Spacer()

            Text(isHidden ? "••••••••" : value)
                .font(.system(.body, design: .monospaced))
                .foregroundColor(.textPrimary)

            Button(action: onToggle) {
                Image(systemName: isHidden ? "eye" : "eye.slash")
                    .foregroundColor(.primaryAmber)
            }

            Button(action: {
                UIPasteboard.general.string = value
            }) {
                Image(systemName: "doc.on.doc")
                    .foregroundColor(.primaryAmber)
            }
        }
    }
}

// MARK: - TOTP Code View
struct TOTPCodeView: View {
    let secret: String
    @State private var code: String = "000000"
    @State private var timeRemaining: Int = 30
    @State private var timer: Timer?

    var body: some View {
        HStack {
            // Code display
            Text(formattedCode)
                .font(.system(.title3, design: .monospaced))
                .fontWeight(.bold)
                .foregroundColor(.primaryAmber)

            Spacer()

            // Timer
            ZStack {
                Circle()
                    .stroke(Color.textMuted.opacity(0.3), lineWidth: 3)

                Circle()
                    .trim(from: 0, to: CGFloat(timeRemaining) / 30.0)
                    .stroke(
                        timeRemaining <= 5 ? Color.error : Color.primaryAmber,
                        style: StrokeStyle(lineWidth: 3, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))

                Text("\(timeRemaining)")
                    .font(.labelSmall)
                    .fontWeight(.bold)
                    .foregroundColor(timeRemaining <= 5 ? .error : .primaryAmber)
            }
            .frame(width: 40, height: 40)

            // Copy button
            Button(action: {
                UIPasteboard.general.string = code
            }) {
                Image(systemName: "doc.on.doc")
                    .foregroundColor(.primaryAmber)
                    .padding(Spacing.sm)
                    .background(Color.backgroundTertiary)
                    .cornerRadius(CornerRadius.sm)
            }
        }
        .padding(Spacing.md)
        .background(Color.primaryAmber.opacity(0.1))
        .cornerRadius(CornerRadius.md)
        .onAppear {
            updateTOTP()
            startTimer()
        }
        .onDisappear {
            timer?.invalidate()
        }
    }

    private var formattedCode: String {
        let index = code.index(code.startIndex, offsetBy: 3)
        return "\(code[..<index]) \(code[index...])"
    }

    private func updateTOTP() {
        // Generate TOTP code (simplified - in production use proper TOTP library)
        // This is a placeholder - you'd use a proper TOTP library like SwiftOTP
        code = String(format: "%06d", Int.random(in: 0...999999))

        let now = Date()
        let seconds = Int(now.timeIntervalSince1970)
        timeRemaining = 30 - (seconds % 30)
    }

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            timeRemaining -= 1
            if timeRemaining <= 0 {
                updateTOTP()
            }
        }
    }
}

// MARK: - View Model
@MainActor
class AccountsViewModel: ObservableObject {
    @Published var accounts: [PlatformAccount] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    func loadAccounts() async {
        isLoading = true
        errorMessage = nil

        do {
            accounts = try await APIService.shared.getPlatformAccounts()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}

// MARK: - Add Account View
struct AddAccountView: View {
    @Environment(\.dismiss) var dismiss
    @State private var platform = "Ticketmaster"
    @State private var email = ""
    @State private var password = ""
    @State private var twoFactorSecret = ""
    @State private var phoneNumber = ""
    @State private var notes = ""
    @State private var isLoading = false

    var body: some View {
        NavigationView {
            ZStack {
                Color.backgroundPrimary.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: Spacing.md) {
                        // Platform picker
                        Picker("Platform", selection: $platform) {
                            ForEach(PurchasePlatform.allCases, id: \.rawValue) { platform in
                                Text(platform.rawValue).tag(platform.rawValue)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        .padding(Spacing.md)
                        .background(Color.backgroundSecondary)
                        .cornerRadius(CornerRadius.md)

                        // Form fields
                        TextField("Email", text: $email)
                            .textFieldStyle(CustomTextFieldStyle())
                            .textInputAutocapitalization(.never)
                            .keyboardType(.emailAddress)

                        SecureField("Password", text: $password)
                            .textFieldStyle(CustomTextFieldStyle())

                        TextField("2FA Secret (optional)", text: $twoFactorSecret)
                            .textFieldStyle(CustomTextFieldStyle())
                            .textInputAutocapitalization(.never)

                        TextField("Phone Number (optional)", text: $phoneNumber)
                            .textFieldStyle(CustomTextFieldStyle())
                            .keyboardType(.phonePad)

                        TextField("Notes (optional)", text: $notes, axis: .vertical)
                            .textFieldStyle(CustomTextFieldStyle())
                            .lineLimit(3...6)

                        PrimaryButton(
                            title: "Add Account",
                            icon: "plus",
                            isLoading: isLoading
                        ) {
                            Task {
                                await saveAccount()
                            }
                        }
                        .padding(.top, Spacing.md)
                    }
                    .padding(Spacing.lg)
                }
            }
            .navigationTitle("Add Account")
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

    private func saveAccount() async {
        isLoading = true

        let request = CreatePlatformAccountRequest(
            platform: platform,
            email: email,
            password: password,
            twoFactorSecret: twoFactorSecret.isEmpty ? nil : twoFactorSecret,
            phoneNumber: phoneNumber.isEmpty ? nil : phoneNumber,
            notes: notes.isEmpty ? nil : notes
        )

        do {
            _ = try await APIService.shared.createPlatformAccount(request)
            dismiss()
        } catch {
            print("Error: \(error)")
        }

        isLoading = false
    }
}

#Preview {
    AccountsView()
        .environmentObject(ThemeManager())
}
