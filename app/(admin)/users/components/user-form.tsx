import { createUserAction } from "@/app/_action/user"
import { CreateUserReq, createUserReq } from "@/lib/schemas/user-req"
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
import { FormEvent, useTransition } from "react"
import { useForm } from "react-hook-form"

interface NewUserFormProps {
  onCreated?: () => void
}

export default function NewUserForm({ onCreated }: NewUserFormProps) {
  const [isPending, starTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<CreateUserReq>({
    resolver: zodResolver(createUserReq),
    defaultValues: {
      username: "",
      password: "",
      perms: [],
    },
  })

  const { control, handleSubmit } = form

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    void handleSubmit((data) => {
      starTransition(async () => {
        const result = await createUserAction(data)
        if (result.success) {
          toast({
            title: "User created",
            description: `User ${data.username} created successfully`,
          })
          onCreated?.()
          form.reset()
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
                  At least 8 characters, only letters, numbers, and
                  dash/underscores.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            Create
          </Button>
        </form>
      </Form>
    </div>
  )
}
