"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/sdui/ui/select"
import { cn } from "@/sdui/utils"
import { useControllableValue } from "ahooks"
import { ComponentPropsWithoutRef } from "react"
import useSwr from "swr"
import { fetchApp } from "../_fetcher/app"

export interface AppSelectProps
  extends Omit<ComponentPropsWithoutRef<"button">, "value" | "onChange"> {
  value?: string
  onChange?: (app: string) => void
}

const AppSelect = ({ value, onChange, className }: AppSelectProps) => {
  const [val, setVal] = useControllableValue<string>({ value, onChange })
  const { data: apps, isLoading } = useSwr("/api/admin/app", fetchApp, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return (
    <Select onValueChange={setVal} value={val}>
      <SelectTrigger className={cn("w-44", className)}>
        <SelectValue placeholder={isLoading ? "Loading" : "Select an App"} />
      </SelectTrigger>
      <SelectContent>
        {apps?.map((item) => (
          <SelectItem key={item.name} value={item.name}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default AppSelect
