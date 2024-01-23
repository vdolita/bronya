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
        <div className="flex-auto flex justify-center items-center space-x-10">
          <Link className="text-lg" href="/licenses">
            View license
          </Link>
        </div>
      </div>
    </main>
  )
}
