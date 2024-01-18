import { isAuthenticated } from "@/lib/auth/helper"
import { redirect } from "next/navigation"
import LicenseTable from "./components/license-table"

export default async function LicensePage() {
  const isAuthed = await isAuthenticated()

  if (!isAuthed) {
    redirect("/auth/login")
  }

  return (
    <div className="h-full">
      <LicenseTable />
    </div>
  )
}
