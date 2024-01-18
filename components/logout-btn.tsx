"use client"

import { Button } from "@/sdui/ui/button"
import { ExitIcon } from "@radix-ui/react-icons"
import { signOut } from "next-auth/react"

export default function LogoutBtn() {
  const handleLogout = () => {
    void signOut({ callbackUrl: "/auth/login" })
  }

  return (
    <Button variant="link" onClick={handleLogout}>
      <ExitIcon className="mr-2" />
      Logout
    </Button>
  )
}
