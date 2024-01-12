"use client"

import { createLicense } from "@/app/_fetcher/license"
import FormAppSelect from "@/components/form-app-select"
import FormDatePicker from "@/components/form-date-picker"
import { CreateLicenseReq, createLicenseReq } from "@/lib/schemas"
import { Button } from "@/sdui/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useToast } from "@/sdui/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { startOfDay } from "date-fns"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import useSWRMutation from "swr/mutation"
import LabelsBox from "./labels-box"

interface CreateLicenseDialogProps {
  onCreated?: () => void
}

const CreateLicenseDialog = ({ onCreated }: CreateLicenseDialogProps) => {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<CreateLicenseReq>({
    resolver: zodResolver(createLicenseReq),
    defaultValues: {
      app: "",
      validFrom: startOfDay(new Date()),
      quantity: 10,
      days: 31,
      totalActTimes: 1,
      rollingDays: 0,
      labels: [],
    },
  })

  const { trigger, isMutating } = useSWRMutation(
    "/api/admin/license",
    createLicense
  )

  async function onSubmit(data: CreateLicenseReq) {
    const isSuccess = await trigger(data)
    if (isSuccess) {
      form.reset()
      setOpen(false)
      toast({
        title: "License created",
        description: "License has been created.",
      })
      onCreated?.()
    } else {
      toast({
        title: "License creation failed",
        description: "License creation failed.",
        variant: "destructive",
      })
    }
  }

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setOpen(open)
      if (!open) {
        form.reset()
      }
    },
    [setOpen, form]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Create License</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}>
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Create License</DialogTitle>
                <DialogDescription>
                  Batch create licenses for your app.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col space-y-4">
                <FormAppSelect
                  control={form.control}
                  name="app"
                  label="App"
                  placeholder="Select an app"
                />
                <FormDatePicker
                  control={form.control}
                  name="validFrom"
                  label="Valid From"
                  desc="The date from which the license is able to be used."
                  placeholder="Pick a date"
                />
                <div className="grid grid-cols-2 space-x-2">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel title="The number of licenses to be created.">
                          Quantity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="quantity"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel title="The number of days the license is valid.">
                          Duration days
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="duration days"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 space-x-2">
                  <FormField
                    control={form.control}
                    name="totalActTimes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel title="The number of times the license can be use for activation.">
                          Total activation times
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="total activation times"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rollingDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel title="The number of days within verification code rolling, set 0 to disable rolling.">
                          Rolling days
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="rolling days"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="labels"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormItem>
                      <FormLabel>Labels</FormLabel>
                      <FormControl>
                        <LabelsBox
                          value={new Set(value)}
                          onChange={(v) => onChange(Array.from(v))}
                          onBlur={onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button className="w-full" type="submit" disabled={isMutating}>
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

export default CreateLicenseDialog
