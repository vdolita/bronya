import { User } from "@/lib/schemas"
import { Button } from "@/sdui/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/sdui/ui/dialog"
import { useState } from "react"
import EditUserForm from "./edit-form"

interface EditUserDialogProps {
  user: User
  onSaved?: () => void
}

export default function EditUserDialog({ user, onSaved }: EditUserDialogProps) {
  const [isOpen, setOpen] = useState<boolean>(false)

  const handleUserSaved = () => {
    setOpen(false)
    onSaved?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <EditUserForm user={user} onSaved={handleUserSaved} />
      </DialogContent>
    </Dialog>
  )
}
