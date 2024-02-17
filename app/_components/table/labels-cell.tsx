"use client"

import LabelsBox from "@/components/labels-box"
import { useToast } from "@/sdui/ui/use-toast"

interface LabelsCellProps {
  value: string[]
  disabled?: boolean
  onChange: (labels: string[]) => Promise<boolean>
}

export default function LabelsCell({
  value,
  disabled,
  onChange,
}: LabelsCellProps) {
  const ctlVal = new Set(value)
  const { toast } = useToast()

  const handleLabelsChange = (labels: Set<string>) => {
    onChange(Array.from(labels))
      .then()
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
      disabled={disabled}
      onChange={handleLabelsChange}
      className="max-w-40"
    />
  )
}
