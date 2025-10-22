"use server"

import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function signInWithDiscord() {
  await signIn("discord")
}
