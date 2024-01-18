import UserForm from "@/components/user-form"
import getQueryAdapter from "@/lib/query"
import { redirect } from "next/navigation"

export default async function SystemInitPage() {
  const isInit = await isInitialed()

  if (isInit) {
    redirect("/")
  }

  return (
    <div className="h-full flex items-center">
      <div className="w-fit flex flex-col items-center mx-auto space-y-8">
        <h1 className="text-2xl">Create admin user</h1>
        <UserForm />
      </div>
    </div>
  )
}

async function isInitialed() {
  const q = getQueryAdapter().user

  const userCount = await q.count()
  return userCount > 0
}
