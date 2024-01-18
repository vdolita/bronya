"use client"

import { AuthCredential, authCredential } from "@/lib/schemas"
import { Button } from "@/sdui/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/sdui/ui/form"
import { Input } from "@/sdui/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useTransition } from "react"
import { useForm } from "react-hook-form"

export default function LoginForm() {
  const [isPending, starTransition] = useTransition()

  const form = useForm<AuthCredential>({
    resolver: zodResolver(authCredential),
    defaultValues: {
      username: "",
      password: "",
    },
  })
  const { handleSubmit, control } = form

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    void handleSubmit((data) => {
      starTransition(async () => {
        await signIn("credentials", {
          username: data.username,
          password: data.password,
        })
      })
    })(e)
  }

  return (
    <div className="w-96 h-fit">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
          <FormField
            control={control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
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
                  <Input placeholder="password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit" disabled={isPending}>
            Submit
          </Button>
        </form>
      </Form>
      <div className="h-40" />
    </div>
  )
}
