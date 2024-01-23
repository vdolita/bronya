import { isAuthenticated } from "@/lib/auth/helper"
import { redirect } from "next/navigation"
import AppListTable from "./components/app-table"

export default async function AppListPage() {
  const isAuthed = await isAuthenticated()

  if (!isAuthed) {
    redirect("/auth/login")
  }

  return (
    <div className="h-full">
      <AppListTable />
    </div>
  )
}
