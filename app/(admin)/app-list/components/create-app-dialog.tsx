"use client"

import { createAppAction } from "@/app/_action/app"
import { CreateAppData, createAppData } from "@/app/_action/app-req"
import { APP_ENCRYPT_JWS, APP_ENCRYPT_NONE } from "@/lib/meta"
import { Button } from "@/sdui/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/sdui/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/sdui/ui/form"
import { Input } from "@/sdui/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/sdui/ui/select"
import { useToast } from "@/sdui/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

interface CreateAppDialogProps {
  onAppCreated?: () => void
}

const CreateAppDialog = ({ onAppCreated }: CreateAppDialogProps) => {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<CreateAppData>({
    resolver: zodResolver(createAppData),
    defaultValues: {
      name: "",
      version: "0.0.1",
      encryptType: APP_ENCRYPT_NONE,
    },
  })

  const { control, handleSubmit } = form

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    void handleSubmit((data) => {
      startTransition(async () => {
        const { success } = await createAppAction(data)
        if (success) {
          form.reset()
          setOpen(false)
          toast({
            title: "App created",
            description: "App has been created.",
          })
          onAppCreated?.()
        } else {
          toast({
            title: "App creation failed",
            description: "App creation failed.",
            variant: "destructive",
          })
        }
      })
    })(e)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Create App</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Create new app</DialogTitle>
              </DialogHeader>
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App name</FormLabel>
                    <FormControl>
                      <Input placeholder="App name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="0.0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="encryptType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Encrypt type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a encrypt type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={APP_ENCRYPT_NONE}>None</SelectItem>
                        <SelectItem value={APP_ENCRYPT_JWS}>
                          JWS-ES256
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  Create
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateAppDialog
