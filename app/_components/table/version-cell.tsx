import { Button } from "@/sdui/ui/button"
import { Input } from "@/sdui/ui/input"
import { useToast } from "@/sdui/ui/use-toast"
import { ChangeEvent, useState, useTransition } from "react"

interface VersionCellProps {
  value: string
  onSave: (value: string) => Promise<boolean>
}

export default function VersionCell({ value, onSave }: VersionCellProps) {
  const [ctrVal, setCtrVal] = useState(value)
  const [isPending, startTransition] = useTransition()
  const isChanged = ctrVal != value
  const { toast } = useToast()

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const newVal = event.target.value
    setCtrVal(newVal)
  }

  function handleSave() {
    if (!isChanged) return
    startTransition(async () => {
      const isSuccess = await onSave(ctrVal)
      if (!isSuccess) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update version",
        })
      }
    })
  }

  return (
    <div className="flex flex-row space-x-2 w-fit">
      <Input className="w-32" value={ctrVal} onChange={handleChange} />
      <Button disabled={!isChanged || isPending} onClick={handleSave}>
        Save
      </Button>
    </div>
  )
}
