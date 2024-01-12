import { SORT_ASC, SORT_DESC, SortDirection } from "@/lib/meta"
import { Button } from "@/sdui/ui/button"
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"

interface SortHeaderProps {
  text: string
  value: SortDirection | false
  onChange?: () => void
}

export default function SortHeader({ text, value, onChange }: SortHeaderProps) {
  return (
    <div className="flex items-center space-x-1">
      <Button
        className="w-full justify-start p-0 space-x-2 rounded-none"
        variant="ghost"
        onClick={onChange}
      >
        <span>{text}</span>
        <div className="flex flex-col -space-y-2.5 justify-items-center">
          <ChevronUpIcon className={value == SORT_DESC ? "invisible" : ""} />
          <ChevronDownIcon className={value == SORT_ASC ? "invisible" : ""} />
        </div>
      </Button>
    </div>
  )
}
