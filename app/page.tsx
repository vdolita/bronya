import { isAuthenticated } from "@/lib/auth/helper"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function Home() {
  const isAuthed = await isAuthenticated()

  if (!isAuthed) {
    redirect("/auth/login")
  }

  return (
    <main className="h-screen">
      <div className="flex flex-col h-full">
        <div className="h-12"></div>
        <div className="flex-auto flex justify-center items-center">
          <Link className="text-lg" href="/auth/login">
            Go Login
          </Link>
        </div>
      </div>
    </main>
  )
}
