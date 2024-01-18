import { sessionHelper } from "@/lib/auth/helper"
import { FaceIcon } from "@radix-ui/react-icons"
import LogoutBtn from "./logout-btn"

export default async function UserPanel() {
  const session = await sessionHelper()

  if (!session) {
    return null
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="inline-flex items-center">
        <FaceIcon className="mr-2" />
        {session.user?.name}
      </span>
      <LogoutBtn />
    </div>
  )
}
