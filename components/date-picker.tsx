import { Button } from "@/sdui/ui/button"
import { Calendar } from "@/sdui/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/sdui/ui/popover"
import { cn } from "@/sdui/utils"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { ButtonHTMLAttributes } from "react"

interface DatePickerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange"> {
  value?: Date
  prefix?: string
  placeholder?: string
  disabled?: boolean
  onChange?: (date?: Date) => void
}

const DatePicker = ({
  value,
  prefix,
  placeholder,
  disabled,
  onChange,
  className,
  id,
  ...rest
}: DatePickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "min-w-48 justify-start text-left font-normal",
            className,
            !value && "text-muted-foreground"
          )}
          {...rest}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {prefix && <span className="mr-2">{prefix}</span>}
          {value ? (
            format(value, "yyyy-MM-dd")
          ) : (
            <span>{placeholder ?? "Pick a date"}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker
