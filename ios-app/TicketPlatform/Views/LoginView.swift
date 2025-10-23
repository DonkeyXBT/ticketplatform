//
//  LoginView.swift
//  TicketPlatform
//
//  Discord OAuth login screen matching web design
//

import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient.primaryGradient
                .ignoresSafeArea()

            VStack(spacing: Spacing.xl) {
                Spacer()

                // Logo and title
                VStack(spacing: Spacing.md) {
                    Image(systemName: "ticket.fill")
                        .font(.system(size: 64))
                        .foregroundStyle(
                            LinearGradient.amberGradient
                        )

                    Text("Ticket Platform")
                        .font(.displayLarge)
                        .foregroundColor(.textPrimary)

                    Text("Professional ticket reselling management")
                        .font(.bodyMedium)
                        .foregroundColor(.textSecondary)
                        .multilineTextAlignment(.center)
                }

                Spacer()

                // Login form
                VStack(spacing: Spacing.md) {
                    // Email field
                    TextField("Email", text: $email)
                        .textFieldStyle(CustomTextFieldStyle())
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)

                    // Password field
                    SecureField("Password", text: $password)
                        .textFieldStyle(CustomTextFieldStyle())

                    // Error message
                    if let error = authManager.errorMessage {
                        Text(error)
                            .font(.bodySmall)
                            .foregroundColor(.error)
                            .padding(.horizontal, Spacing.md)
                    }

                    // Sign in button
                    Button(action: {
                        Task {
                            await authManager.login(email: email, password: password)
                        }
                    }) {
                        HStack {
                            if authManager.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Image(systemName: "arrow.right.circle.fill")
                                Text("Sign In")
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .font(.headingMedium)
                        .foregroundColor(.white)
                        .background(LinearGradient.amberGradient)
                        .cornerRadius(CornerRadius.md)
                    }
                    .disabled(authManager.isLoading || email.isEmpty || password.isEmpty)
                    .opacity(email.isEmpty || password.isEmpty ? 0.6 : 1.0)

                    // Discord OAuth button
                    Button(action: {
                        // Discord OAuth would open web view or deep link
                    }) {
                        HStack {
                            Image(systemName: "person.circle.fill")
                            Text("Sign in with Discord")
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .font(.headingMedium)
                        .foregroundColor(.white)
                        .background(Color(hex: "#5865F2"))
                        .cornerRadius(CornerRadius.md)
                    }
                }
                .padding(.horizontal, Spacing.xl)

                Spacer()

                // Footer
                Text("Secure authentication • Your data is encrypted")
                    .font(.bodySmall)
                    .foregroundColor(.textMuted)
                    .padding(.bottom, Spacing.lg)
            }
        }
    }
}

// MARK: - Custom Text Field Style
struct CustomTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding(Spacing.md)
            .background(Color.backgroundSecondary.opacity(0.5))
            .cornerRadius(CornerRadius.md)
            .foregroundColor(.textPrimary)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.md)
                    .stroke(Color.primaryAmber.opacity(0.3), lineWidth: 1)
            )
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthenticationManager())
        .environmentObject(ThemeManager())
}
