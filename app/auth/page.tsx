import { redirect } from "next/navigation"
import { checkIsLoggedIn } from "./actions"
import LoginForm from "./components/login-form"

export default async function AuthPage() {
  const isLoggedIn = await checkIsLoggedIn()
  if (isLoggedIn) {
    redirect("/licenses")
  }

  return (
    <div className="h-full w-full flex justify-center items-center">
      <LoginForm />
    </div>
  )
}
