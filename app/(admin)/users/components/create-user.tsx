"use client"

import { Button } from "@/sdui/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/sdui/ui/dialog"
import NewUserForm from "./user-form"

const CreateUserDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Create User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <NewUserForm />
      </DialogContent>
    </Dialog>
  )
}

export default CreateUserDialog
