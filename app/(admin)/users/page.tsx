import { isAuthenticated } from "@/lib/auth/helper"
import { redirect } from "next/navigation"
import UserListTable from "./components/user-table"

export default async function UsersPage() {
  const isAuthed = await isAuthenticated()

  if (!isAuthed) {
    redirect("/auth/login")
  }

  return (
    <div>
      <UserListTable />
    </div>
  )
}
