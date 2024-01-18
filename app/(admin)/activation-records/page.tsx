import { isAuthenticated } from "@/lib/auth/helper"
import { redirect } from "next/navigation"
import ActRecordsTable from "./components/ar-table"

export default async function ActRecordsPage() {
  const isAuthed = await isAuthenticated()

  if (!isAuthed) {
    redirect("/auth/login")
  }

  return (
    <div className="h-full">
      <ActRecordsTable />
    </div>
  )
}
