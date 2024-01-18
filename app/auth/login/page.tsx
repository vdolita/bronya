import { isAuthenticated } from "@/lib/auth/helper"
import { redirect } from "next/navigation"
import LoginForm from "./components/login-form"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const isAuthed = await isAuthenticated()

  if (isAuthed) {
    const redirectUrl = searchParams["redirect"] as string | undefined

    if (redirectUrl) {
      redirect(redirectUrl)
    } else {
      redirect("/")
    }
  }

  return (
    <div className="h-full w-full flex justify-center items-center">
      <LoginForm />
    </div>
  )
}
