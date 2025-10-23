//
//  AuthenticationManager.swift
//  TicketPlatform
//
//  Manages user authentication state
//

import Foundation
import Combine

class AuthenticationManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?

    init() {
        // Check if user is already logged in
        if KeychainManager.shared.getToken() != nil {
            isAuthenticated = true
            // Optionally fetch user details
        }
    }

    func login(email: String, password: String) async {
        await MainActor.run {
            isLoading = true
            errorMessage = nil
        }

        do {
            let response = try await APIService.shared.login(email: email, password: password)

            // Save token to keychain
            KeychainManager.shared.saveToken(response.token)

            await MainActor.run {
                self.currentUser = response.user
                self.isAuthenticated = true
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }

    func logout() {
        KeychainManager.shared.deleteToken()
        isAuthenticated = false
        currentUser = nil
    }
}

// MARK: - Keychain Manager
class KeychainManager {
    static let shared = KeychainManager()
    private let service = "com.ticketplatform.app"
    private let account = "authToken"

    private init() {}

    func saveToken(_ token: String) {
        let data = Data(token.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data
        ]

        // Delete any existing item
        SecItemDelete(query as CFDictionary)

        // Add new item
        SecItemAdd(query as CFDictionary, nil)
    }

    func getToken() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        SecItemCopyMatching(query as CFDictionary, &result)

        guard let data = result as? Data,
              let token = String(data: data, encoding: .utf8) else {
            return nil
        }

        return token
    }

    func deleteToken() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]

        SecItemDelete(query as CFDictionary)
    }
}
