import { PermAct } from "@/lib/permit/permission"
import { canPermit, isAdminPerm } from "@/lib/permit/permit"
import "server-only"

interface PermitWrapperProps {
  children: React.ReactNode
  obj: string
  act: PermAct
}

interface PermitWrapperAdminProps {
  children: React.ReactNode
  admin: boolean
}

export default async function PermitWrapper({
  children,
  ...props
}: PermitWrapperProps | PermitWrapperAdminProps) {
  if ("admin" in props) {
    const isAdmin = await isAdminPerm()
    if (!isAdmin) {
      return null
    }
    return <>{children}</>
  }

  const { obj, act } = props

  const isPass = await canPermit(obj, act)

  if (!isPass) {
    return null
  }
  return <>{children}</>
}
