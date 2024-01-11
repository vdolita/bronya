import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/sdui/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/sdui/ui/select";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import useSwr from "swr";
import { fetchApp } from "../app/_fetcher/app";

interface FormAppSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control: Control<TFieldValues>;
  label?: string;
  placeholder?: string;
  desc?: string;
}

const FormAppSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FormAppSelectProps<TFieldValues, TName>,
) => {
  const { control, name, label, placeholder, desc } = props;
  const { data: apps, isLoading } = useSwr("/api/admin/app", fetchApp);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  placeholder={isLoading ? "Loading" : placeholder}
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {apps?.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {desc && <FormDescription>{desc}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormAppSelect;
