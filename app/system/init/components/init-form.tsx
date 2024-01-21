"use client"

import { createAdminUserAction } from "@/app/_action/user"
import { createAdminData } from "@/app/_action/user-req"
import { User } from "@/lib/schemas"
import { Button } from "@/sdui/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/sdui/ui/form"
import { Input } from "@/sdui/ui/input"
import { useToast } from "@/sdui/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { redirect } from "next/navigation"
import { FormEvent, useTransition } from "react"
import { useForm } from "react-hook-form"

export default function InitForm() {
  const [isPending, starTransition] = useTransition()
  const { toast } = useToast()
  const form = useForm<User>({
    resolver: zodResolver(createAdminData),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const { control, handleSubmit } = form

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    void handleSubmit((data) => {
      starTransition(async () => {
        const result = await createAdminUserAction(data)
        if (result.success) {
          redirect("/auth/login")
        } else {
          toast({
            title: "Failed to create user",
            description: result.error || "Unknown error",
            variant: "destructive",
          })
        }
      })
    })(e)
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col w-96 space-y-4">
          <FormField
            control={control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormDescription>
                  At least 1 characters, only letters, numbers, and
                  dash/underscores.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="password" {...field} />
                </FormControl>
                <FormDescription>
                  At least 6 characters, only letters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="h-2"></div>
          <Button
            disabled={isPending}
            className="w-3/4 self-center"
            type="submit"
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  )
}
