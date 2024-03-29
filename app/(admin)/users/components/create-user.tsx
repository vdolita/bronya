"use client"

import { Button } from "@/sdui/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/sdui/ui/dialog"
import { useState } from "react"
import NewUserForm from "./user-form"

interface CreateUserDialogProps {
  onCreated?: () => void
}

const CreateUserDialog = ({ onCreated }: CreateUserDialogProps) => {
  const [isOpen, setOpen] = useState<boolean>(false)

  const handleUserCreated = () => {
    setOpen(false)
    onCreated?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Create User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <NewUserForm onCreated={handleUserCreated} />
      </DialogContent>
    </Dialog>
  )
}

export default CreateUserDialog
