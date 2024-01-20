"use client"

import AppSelect from "@/app/_components/app-select"
import DatePicker from "@/components/date-picker"
import { Button } from "@/sdui/ui/button"
import { endOfDay, format } from "date-fns"
import { useState } from "react"

interface ExportProps {
  type: "lcs" | "ar"
}

export default function Export({ type }: ExportProps) {
  const [from, setFrom] = useState<Date>()
  const [to, setTo] = useState<Date>()
  const [app, setApp] = useState<string>()

  const handleSetTo = (date?: Date) => {
    if (!date) {
      setTo(undefined)
      return
    }

    const end = endOfDay(date)
    setTo(end)
  }

  const handleDownload = () => {
    if (!app) return

    const url = new URL("/api/admin/data-export", window.location.origin)
    url.searchParams.append("type", type)
    url.searchParams.append("app", app)
    if (from) url.searchParams.append("from", from.toISOString())
    if (to) url.searchParams.append("to", to.toISOString())

    const a = document.createElement("a")
    a.href = url.toString()
    a.download = `export-${type}-${format(new Date(), "yyyyMMdd")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-center">
        {type == "ar" ? "Activation record" : "License"}
      </h1>
      <div className="self-center flex space-x-2">
        <span className="text-red-500">*</span>
        <AppSelect value={app} onChange={setApp} />
      </div>
      <div className="flex space-x-4">
        <DatePicker value={from} prefix="From:" onChange={setFrom} />
        <DatePicker value={to} prefix="To:" onChange={handleSetTo} />
      </div>
      <Button
        onClick={handleDownload}
        disabled={!app}
        className="w-60 self-center"
      >
        Export
      </Button>
    </div>
  )
}
