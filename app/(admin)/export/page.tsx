import { isAuthenticated } from "@/lib/auth/helper"
import { redirect } from "next/navigation"
import ExportActivationRecord from "./components/activation-record"
import ExportLicense from "./components/license"

export default async function ExportPage() {
  const isAuthed = await isAuthenticated()

  if (!isAuthed) {
    redirect("/auth/login")
  }

  return (
    <div className="h-full">
      <div className="pt-48 flex justify-center items-center divide-x">
        <div className="pr-5">
          <ExportLicense />
        </div>
        <div className="pl-5">
          <ExportActivationRecord />
        </div>
      </div>
    </div>
  )
}
