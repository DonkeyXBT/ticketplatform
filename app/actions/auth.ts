"use server"

import { signIn } from "@/lib/auth"

export async function signInWithDiscord() {
  console.log("🚀 [ACTION] signInWithDiscord called")
  console.log("🎯 [ACTION] Target redirect: /dashboard")
  try {
    await signIn("discord", { redirectTo: "/dashboard" })
    console.log("✅ [ACTION] signIn completed successfully")
  } catch (error) {
    console.error("❌ [ACTION] signIn error:", error)
    throw error
  }
}
