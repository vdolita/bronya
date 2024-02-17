"use client"

import { PermAct, permActAll, permRscAll } from "@/lib/permit/permission"
import { usePermit } from "../_hooks/permit"

interface PermitWrapperProps {
  children: React.ReactNode
  obj: string
  act: PermAct
}

interface PermitWrapperAdminProps {
  children: React.ReactNode
  admin: boolean
}

export default function PermitWrapper(
  props: PermitWrapperProps | PermitWrapperAdminProps,
) {
  const { children } = props
  const targetAct = "admin" in props ? permActAll : props.act
  const targetObj = "admin" in props ? permRscAll : props.obj

  const isPass = usePermit(targetAct, targetObj)

  if (isPass) {
    return <>{children}</>
  }

  return null
}
