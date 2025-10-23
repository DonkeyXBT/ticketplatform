import crypto from "crypto"

// Encryption key - should be stored in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-32-char-key-change-this!"

// Ensure the key is 32 bytes (256 bits) for AES-256
const getKey = () => {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32))
  return key
}

/**
 * Encrypts a string using AES-256-GCM
 * @param text - The text to encrypt
 * @returns Encrypted text in format: iv:authTag:encryptedData
 */
export function encrypt(text: string): string {
  if (!text) return ""

  try {
    const iv = crypto.randomBytes(16) // Initialization vector
    const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv)

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const authTag = cipher.getAuthTag()

    // Return iv:authTag:encryptedData format
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt data")
  }
}

/**
 * Decrypts a string encrypted with AES-256-GCM
 * @param encryptedText - The encrypted text in format: iv:authTag:encryptedData
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return ""

  try {
    const parts = encryptedText.split(":")
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format")
    }

    const iv = Buffer.from(parts[0], "hex")
    const authTag = Buffer.from(parts[1], "hex")
    const encrypted = parts[2]

    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt data")
  }
}

/**
 * Generates a secure random encryption key
 * Use this to generate a new ENCRYPTION_KEY for your .env file
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex")
}
