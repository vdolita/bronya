"use client"

import LabelsBox from "@/components/labels-box"
import { useToast } from "@/sdui/ui/use-toast"
import { useState } from "react"

interface LabelsCellProps {
  value: string[]
  onChange: (labels: string[]) => Promise<boolean>
}

export default function LabelsCell({ value, onChange }: LabelsCellProps) {
  const [ctlVal, setCtlVal] = useState(new Set(value))
  const { toast } = useToast()

  const handleLabelsChange = (labels: Set<string>) => {
    onChange(Array.from(labels))
      .then((isSuccess) => {
        if (isSuccess) {
          setCtlVal(labels)
        }
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update labels",
        })
      })
  }

  return (
    <LabelsBox
      value={ctlVal}
      onChange={handleLabelsChange}
      className="max-w-40"
    />
  )
}
