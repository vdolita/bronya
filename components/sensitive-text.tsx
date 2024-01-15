import { Button } from "@/sdui/ui/button"
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons"
import { useState } from "react"

export default function SensitiveText({ text }: { text: string }) {
  const [isHidden, setIsHidden] = useState(true)
  const replacedText = text.replace(/./g, "*")

  return (
    <div className="w-fit space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsHidden(!isHidden)}
      >
        {isHidden ? (
          <EyeOpenIcon className="mr-2" />
        ) : (
          <EyeClosedIcon className="mr-2" />
        )}
        {isHidden ? "View" : "Hide"}
      </Button>
      {isHidden ? (
        <pre>{replacedText}</pre>
      ) : (
        <pre className="select-all">{text}</pre>
      )}
    </div>
  )
}
