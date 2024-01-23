import LogoutBtn from "@/app/_components/logout-btn"
import { sessionHelper } from "@/lib/auth/helper"

export default async function UserPanel() {
  const session = await sessionHelper()

  if (!session) {
    return null
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="inline-flex items-center">🐼 {session.user?.name}</span>
      <LogoutBtn />
    </div>
  )
}
