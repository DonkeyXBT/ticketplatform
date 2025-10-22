import { redirect } from "next/navigation"

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // Redirect all auth errors to the setup page for better UX
  redirect("/setup")
}
