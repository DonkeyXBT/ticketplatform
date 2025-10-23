//
//  APIService.swift
//  TicketPlatform
//
//  API service layer for communicating with the backend
//

import Foundation

class APIService {
    static let shared = APIService()

    private let baseURL: String
    private let session: URLSession

    private init() {
        // Use environment variable or default to localhost
        self.baseURL = ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http://localhost:3000"

        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 300
        self.session = URLSession(configuration: configuration)
    }

    // MARK: - Generic Request Method
    private func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Encodable? = nil
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add authentication token if available
        if let token = KeychainManager.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Add body if provided
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(T.self, from: data)
    }

    // MARK: - Authentication
    func login(email: String, password: String) async throws -> AuthResponse {
        try await request(
            endpoint: "/api/auth/signin",
            method: "POST",
            body: ["email": email, "password": password]
        )
    }

    // MARK: - Tickets
    func getTickets() async throws -> [Ticket] {
        try await request(endpoint: "/api/tickets")
    }

    func createTicket(_ ticket: CreateTicketRequest) async throws -> Ticket {
        try await request(
            endpoint: "/api/tickets",
            method: "POST",
            body: ticket
        )
    }

    func updateTicket(id: String, _ ticket: CreateTicketRequest) async throws -> Ticket {
        try await request(
            endpoint: "/api/tickets/\(id)",
            method: "PATCH",
            body: ticket
        )
    }

    func deleteTicket(id: String) async throws -> EmptyResponse {
        try await request(
            endpoint: "/api/tickets/\(id)",
            method: "DELETE"
        )
    }

    // MARK: - Sales
    func getSales(ticketId: String) async throws -> [Sale] {
        try await request(endpoint: "/api/tickets/\(ticketId)/sales")
    }

    func createSale(ticketId: String, _ sale: CreateSaleRequest) async throws -> Sale {
        try await request(
            endpoint: "/api/tickets/\(ticketId)/sales",
            method: "POST",
            body: sale
        )
    }

    func updateSale(id: String, _ sale: CreateSaleRequest) async throws -> Sale {
        try await request(
            endpoint: "/api/sales/\(id)",
            method: "PATCH",
            body: sale
        )
    }

    func deleteSale(id: String) async throws -> EmptyResponse {
        try await request(
            endpoint: "/api/sales/\(id)",
            method: "DELETE"
        )
    }

    func toggleTicketsSent(saleId: String) async throws -> ToggleSentResponse {
        try await request(
            endpoint: "/api/sales/\(saleId)/toggle-sent",
            method: "POST"
        )
    }

    // MARK: - Platform Accounts
    func getPlatformAccounts() async throws -> [PlatformAccount] {
        try await request(endpoint: "/api/platform-accounts")
    }

    func createPlatformAccount(_ account: CreatePlatformAccountRequest) async throws -> PlatformAccount {
        try await request(
            endpoint: "/api/platform-accounts",
            method: "POST",
            body: account
        )
    }

    func updatePlatformAccount(id: String, _ account: CreatePlatformAccountRequest) async throws -> PlatformAccount {
        try await request(
            endpoint: "/api/platform-accounts/\(id)",
            method: "PATCH",
            body: account
        )
    }

    func deletePlatformAccount(id: String) async throws -> EmptyResponse {
        try await request(
            endpoint: "/api/platform-accounts/\(id)",
            method: "DELETE"
        )
    }
}

// MARK: - Response Types
struct AuthResponse: Codable {
    let token: String
    let user: User
}

struct EmptyResponse: Codable {}

struct ToggleSentResponse: Codable {
    let success: Bool
    let ticketsSent: Bool
}

// MARK: - Errors
enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int)
    case decodingError(Error)
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let statusCode):
            return "HTTP error: \(statusCode)"
        case .decodingError(let error):
            return "Decoding error: \(error.localizedDescription)"
        case .unauthorized:
            return "Unauthorized. Please log in again."
        }
    }
}
