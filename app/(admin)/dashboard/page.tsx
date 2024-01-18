import { isAuthenticated } from "@/lib/auth/helper"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const isAuthed = await isAuthenticated()

  if (!isAuthed) {
    redirect("/auth/login")
  }

  return (
    <div className="h-screen">
      <h1>License Page</h1>
    </div>
  )
}
