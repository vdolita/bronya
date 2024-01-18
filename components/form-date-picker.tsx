import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/sdui/ui/form"
import { Control, FieldPath, FieldValues } from "react-hook-form"
import DatePicker from "./date-picker"

interface DatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
  control: Control<TFieldValues>
  desc?: string
  label?: string
  placeholder?: string
}

const FormDatePicker = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: DatePickerProps<TFieldValues, TName>
) => {
  const { name, label, placeholder, desc, control } = props
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          {label && <FormLabel>{label}</FormLabel>}
          <DatePicker
            placeholder={placeholder}
            value={field.value}
            onChange={field.onChange}
          />
          {desc && <FormDescription>{desc}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormDatePicker
