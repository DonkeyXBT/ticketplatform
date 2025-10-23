//
//  ProfileView.swift
//  TicketPlatform
//
//  User profile and settings
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        NavigationView {
            ZStack {
                Color.backgroundPrimary.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: Spacing.xl) {
                        // Profile header
                        VStack(spacing: Spacing.md) {
                            // Avatar
                            Circle()
                                .fill(LinearGradient.primaryGradient)
                                .frame(width: 100, height: 100)
                                .overlay(
                                    Image(systemName: "person.fill")
                                        .font(.system(size: 50))
                                        .foregroundColor(.white)
                                )

                            // User info
                            if let user = authManager.currentUser {
                                Text(user.name ?? "User")
                                    .font(.displaySmall)
                                    .foregroundColor(.textPrimary)

                                if let email = user.email {
                                    Text(email)
                                        .font(.bodyMedium)
                                        .foregroundColor(.textSecondary)
                                }
                            }
                        }
                        .padding(.top, Spacing.lg)

                        // Settings sections
                        VStack(spacing: Spacing.md) {
                            // Appearance
                            SettingsSection(title: "Appearance") {
                                SettingsRow(
                                    icon: "moon.fill",
                                    title: "Dark Mode",
                                    trailing: {
                                        Toggle("", isOn: $themeManager.isDarkMode)
                                            .tint(.primaryAmber)
                                    }
                                )
                            }

                            // Account
                            SettingsSection(title: "Account") {
                                SettingsRow(
                                    icon: "person.circle.fill",
                                    title: "Edit Profile",
                                    action: {}
                                )

                                SettingsRow(
                                    icon: "lock.fill",
                                    title: "Change Password",
                                    action: {}
                                )

                                SettingsRow(
                                    icon: "dollarsign.circle.fill",
                                    title: "Preferred Currency",
                                    trailing: {
                                        Text("USD")
                                            .foregroundColor(.textSecondary)
                                    }
                                )
                            }

                            // About
                            SettingsSection(title: "About") {
                                SettingsRow(
                                    icon: "info.circle.fill",
                                    title: "Version",
                                    trailing: {
                                        Text("1.0.0")
                                            .foregroundColor(.textSecondary)
                                    }
                                )

                                SettingsRow(
                                    icon: "doc.text.fill",
                                    title: "Terms of Service",
                                    action: {}
                                )

                                SettingsRow(
                                    icon: "hand.raised.fill",
                                    title: "Privacy Policy",
                                    action: {}
                                )
                            }

                            // Sign out button
                            Button(action: {
                                authManager.logout()
                            }) {
                                HStack {
                                    Image(systemName: "rectangle.portrait.and.arrow.right")
                                    Text("Sign Out")
                                }
                                .font(.headingMedium)
                                .foregroundColor(.error)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, Spacing.md)
                                .background(Color.error.opacity(0.1))
                                .cornerRadius(CornerRadius.md)
                            }
                            .padding(.top, Spacing.lg)
                        }
                        .padding(.horizontal, Spacing.md)
                    }
                    .padding(.vertical, Spacing.md)
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}

// MARK: - Settings Components
struct SettingsSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text(title)
                .font(.headingSmall)
                .foregroundColor(.textMuted)
                .padding(.horizontal, Spacing.md)

            VStack(spacing: 1) {
                content
            }
            .background(Color.backgroundSecondary)
            .cornerRadius(CornerRadius.lg)
        }
    }
}

struct SettingsRow<Trailing: View>: View {
    let icon: String
    let title: String
    var action: (() -> Void)?
    @ViewBuilder var trailing: () -> Trailing

    init(
        icon: String,
        title: String,
        action: (() -> Void)? = nil,
        @ViewBuilder trailing: @escaping () -> Trailing = { EmptyView() }
    ) {
        self.icon = icon
        self.title = title
        self.action = action
        self.trailing = trailing
    }

    var body: some View {
        Button(action: { action?() }) {
            HStack(spacing: Spacing.md) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(.primaryAmber)
                    .frame(width: 30)

                Text(title)
                    .font(.bodyMedium)
                    .foregroundColor(.textPrimary)

                Spacer()

                trailing()

                if action != nil {
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.textMuted)
                }
            }
            .padding(Spacing.md)
            .contentShape(Rectangle())
        }
        .buttonStyle(PlainButtonStyle())
        .disabled(action == nil)
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthenticationManager())
        .environmentObject(ThemeManager())
}
