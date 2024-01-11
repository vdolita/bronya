import { Button } from "@/sdui/ui/button"
import { Calendar } from "@/sdui/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/sdui/ui/popover"
import { cn } from "@/sdui/utils"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"

interface DatePickerProps {
  value?: Date
  disabled?: boolean
  onChange?: (date?: Date) => void
}

const DatePicker = ({ value, disabled, onChange }: DatePickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "yyyy-MM-dd") : <span>Pick a date</span>}
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
