"use client"

import { Button } from "@/sdui/ui/button"
import { ExitIcon } from "@radix-ui/react-icons"
import { signOut } from "next-auth/react"
import { useSWRConfig } from "swr"

export default function LogoutBtn() {
  const { mutate } = useSWRConfig()

  const handleLogout = () => {
    void clearCache()
    void signOut({ callbackUrl: "/auth/login" })
  }

  const clearCache = () => mutate(() => true, undefined, { revalidate: false })

  return (
    <Button variant="link" onClick={handleLogout}>
      <ExitIcon className="mr-2" />
      Logout
    </Button>
  )
}
