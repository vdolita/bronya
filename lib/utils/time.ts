import { format } from "date-fns"

export function formatDateTime(date: Date): string {
  return format(date, "yyyy-MM-dd HH:mm:ss")
}
