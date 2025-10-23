//
//  Models.swift
//  TicketPlatform
//
//  Data models matching the API structure
//

import Foundation

// MARK: - User
struct User: Codable, Identifiable {
    let id: String
    let name: String?
    let email: String?
    let image: String?
    let preferredCurrency: String?

    enum CodingKeys: String, CodingKey {
        case id, name, email, image
        case preferredCurrency = "preferred_currency"
    }
}

// MARK: - Ticket
struct Ticket: Codable, Identifiable {
    let id: String
    let userId: String
    let artist: String
    let location: String
    let eventDate: Date
    let section: String?
    let row: String?
    let seat: String?
    let quantity: Int
    let buyInPrice: Double?
    let buyCurrency: String?
    let boughtFrom: String?
    let status: TicketStatus
    let orderNumber: String?
    let emailUsed: String?
    let createdAt: Date
    let updatedAt: Date

    // Computed properties from sales
    var totalSold: Int
    var remainingQuantity: Int
    var totalRevenue: Double
    var totalProfit: Double
    var sales: [Sale]

    enum CodingKeys: String, CodingKey {
        case id, userId, artist, location, eventDate, section, row, seat
        case quantity, buyInPrice, buyCurrency, boughtFrom, status
        case orderNumber, emailUsed, createdAt, updatedAt
        case totalSold, remainingQuantity, totalRevenue, totalProfit, sales
    }
}

enum TicketStatus: String, Codable {
    case listed = "Listed"
    case pending = "Pending"
    case sold = "Sold"

    var color: String {
        switch self {
        case .listed: return "blue"
        case .pending: return "amber"
        case .sold: return "green"
        }
    }
}

// MARK: - Sale
struct Sale: Codable, Identifiable {
    let id: String
    let ticketId: String
    let quantitySold: Int
    let salePrice: Double?
    let sellCurrency: String?
    let profit: Double?
    let profitCurrency: String?
    let saleId: String?
    let siteSold: String?
    let deliveryEmail: String?
    let deliveryName: String?
    let ticketsSent: Bool
    let deliveryReminderSent: Bool
    let deliveryReminderAcknowledged: Bool
    let lastReminderSentAt: Date?
    let discordMessageId: String?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id, ticketId, quantitySold, salePrice, sellCurrency
        case profit, profitCurrency, saleId, siteSold
        case deliveryEmail, deliveryName, ticketsSent
        case deliveryReminderSent, deliveryReminderAcknowledged
        case lastReminderSentAt, discordMessageId
        case createdAt, updatedAt
    }
}

// MARK: - Platform Account
struct PlatformAccount: Codable, Identifiable {
    let id: String
    let userId: String
    let platform: String
    let email: String
    let password: String? // Decrypted by API
    let twoFactorSecret: String? // Decrypted by API
    let phoneNumber: String?
    let notes: String?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id, userId, platform, email, password
        case twoFactorSecret, phoneNumber, notes
        case createdAt, updatedAt
    }
}

// MARK: - TOTP Code
struct TOTPCode {
    let code: String
    let timeRemaining: Int

    var formattedCode: String {
        let index = code.index(code.startIndex, offsetBy: 3)
        return "\(code[..<index]) \(code[index...])"
    }
}

// MARK: - API Request/Response Types
struct CreateTicketRequest: Codable {
    let artist: String
    let location: String
    let eventDate: Date
    let section: String?
    let row: String?
    let seat: String?
    let quantity: Int
    let buyInPrice: Double?
    let buyCurrency: String?
    let boughtFrom: String?
    let orderNumber: String?
    let emailUsed: String?
}

struct CreateSaleRequest: Codable {
    let quantitySold: Int
    let salePrice: Double?
    let sellCurrency: String?
    let saleId: String?
    let siteSold: String?
    let deliveryEmail: String?
    let deliveryName: String?
}

struct CreatePlatformAccountRequest: Codable {
    let platform: String
    let email: String
    let password: String
    let twoFactorSecret: String?
    let phoneNumber: String?
    let notes: String?
}

// MARK: - Supported Platforms
enum PurchasePlatform: String, CaseIterable {
    case ticketmaster = "Ticketmaster"
    case axs = "AXS"
    case gigsAndTours = "Gigs And Tours"
    case seeTickets = "SeeTickets"
    case eventim = "Eventim"
    case dice = "Dice"
    case other = "Other"
}

enum SalePlatform: String, CaseIterable {
    case stubhub = "Stubhub"
    case viagogo = "Viagogo"
    case ticketmasterResale = "Ticketmaster Resale"
    case axsResale = "AXS Resale"
    case twickets = "Twickets"
    case other = "Other"
}

// MARK: - Currencies
enum Currency: String, CaseIterable {
    case usd = "USD"
    case eur = "EUR"
    case gbp = "GBP"
    case jpy = "JPY"
    case cad = "CAD"
    case aud = "AUD"
    case chf = "CHF"
    case cny = "CNY"
    case sek = "SEK"
    case nzd = "NZD"
    case mxn = "MXN"
    case sgd = "SGD"
    case hkd = "HKD"
    case krw = "KRW"

    var symbol: String {
        switch self {
        case .usd: return "$"
        case .eur: return "€"
        case .gbp: return "£"
        case .jpy: return "¥"
        case .cad: return "C$"
        case .aud: return "A$"
        case .chf: return "CHF"
        case .cny: return "¥"
        case .sek: return "kr"
        case .nzd: return "NZ$"
        case .mxn: return "MX$"
        case .sgd: return "S$"
        case .hkd: return "HK$"
        case .krw: return "₩"
        }
    }
}
