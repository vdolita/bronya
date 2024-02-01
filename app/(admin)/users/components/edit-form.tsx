import { updateUserAction } from "@/app/_action/user"
import { UpdateUserData, updateUserData } from "@/app/_action/user-req"
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
import { RadioGroup, RadioGroupItem } from "@/sdui/ui/radio-group"
import { useToast } from "@/sdui/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormEvent, useTransition } from "react"
import { useForm } from "react-hook-form"
import PermsSelect from "./perms-select"

interface EditUserFormProps {
  user: User
  onSaved?: () => void
}

export default function EditUserForm({ user, onSaved }: EditUserFormProps) {
  const [isPending, starTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<UpdateUserData>({
    resolver: zodResolver(updateUserData),
    defaultValues: {
      username: user.username,
      password: "",
      status: user.status,
      perms: user.perms,
    },
  })

  const { control, handleSubmit } = form

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    void handleSubmit(
      (data) => {
        starTransition(async () => {
          const result = await updateUserAction(user.username, data)
          if (result.success) {
            toast({
              title: "User Saved",
              description: `User ${data.username} save successfully`,
            })
            onSaved?.()
            form.reset()
          } else {
            toast({
              title: "Failed to save changes",
              description: result.error || "Unknown error",
              variant: "destructive",
            })
          }
        })
      },
      (data) => console.log(data),
    )(e)
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
                  <Input {...field} disabled />
                </FormControl>
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
                  <Input placeholder="leave empty if no change" {...field} />
                </FormControl>
                <FormDescription>
                  At least 8 characters, only letters, numbers, and
                  dash/underscores.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <RadioGroup
                    {...field}
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="active" />
                      </FormControl>
                      <FormLabel className="font-normal">Active</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="disabled" />
                      </FormControl>
                      <FormLabel className="font-normal">Disabled</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="perms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permissions</FormLabel>
                <FormControl>
                  <PermsSelect
                    username={user.username}
                    permissions={field.value || []}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            Save
          </Button>
        </form>
      </Form>
    </div>
  )
}
