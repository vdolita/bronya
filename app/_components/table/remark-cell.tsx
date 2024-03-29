"use client"

import { remark } from "@/lib/meta"
import { Button } from "@/sdui/ui/button"
import { Textarea } from "@/sdui/ui/textarea"
import { useToast } from "@/sdui/ui/use-toast"
import { ReloadIcon } from "@radix-ui/react-icons"
import { ChangeEvent, useState, useTransition } from "react"

interface RemarkCellProps {
  value: string
  disabled?: boolean
  onSave: (value: string) => Promise<boolean>
}

export default function RemarkCell({
  value,
  onSave,
  disabled,
}: RemarkCellProps) {
  const [ctrVal, setCtrVal] = useState(value)
  const [showSave, setShowSave] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const newVal = event.target.value
    const safeVal = remark.safeParse(newVal)

    if (!safeVal.success) {
      return
    }

    setCtrVal(newVal)

    if (newVal != value) {
      setShowSave(true)
    } else {
      setShowSave(false)
    }
  }

  function handleCancel() {
    setCtrVal(value)
    setShowSave(false)
  }

  function saveRemark() {
    startTransition(async () => {
      const isSuccess = await onSave(ctrVal)
      if (isSuccess) {
        setShowSave(false)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update remark",
        })
      }
    })
  }

  return (
    <div className="flex flex-col space-y-2 items-end">
      <Textarea value={ctrVal} onChange={handleChange} disabled={disabled} />
      {showSave && (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handleCancel}>
            cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={saveRemark}
          >
            {isPending ? <ReloadIcon className="mr-2 animate-spin" /> : ""}
            save
          </Button>
        </div>
      )}
    </div>
  )
}
