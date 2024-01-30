import { cn } from "@/sdui/utils"
import { ReactNode } from "react"

interface ScrollBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export default function ScrollBox({
  children,
  className,
  ...rest
}: ScrollBoxProps) {
  return (
    <div className={cn(className, "overflow-y-auto")} {...rest}>
      {children}
    </div>
  )
}
