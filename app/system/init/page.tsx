import { isSystemInitialed } from "@/lib/system"
import { redirect } from "next/navigation"
import InitForm from "./components/init-form"

export default async function SystemInitPage() {
  const isInit = await isSystemInitialed()

  if (isInit) {
    redirect("/")
  }

  return (
    <div className="h-full flex items-center">
      <div className="w-fit flex flex-col items-center mx-auto space-y-8">
        <h1 className="text-2xl">Create admin user</h1>
        <InitForm />
      </div>
    </div>
  )
}
