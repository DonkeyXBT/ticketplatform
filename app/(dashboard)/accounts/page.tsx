import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AccountsClient from "@/components/AccountsClient"

export default async function AccountsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return <AccountsClient user={session.user} />
}
