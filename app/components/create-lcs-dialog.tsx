"use client";

import FormAppSelect from "@/app/components/form-app-select";
import FormDatePicker from "@/app/components/form-date-picker";
import { CreateLicenseReq, createLicenseReq } from "@/schemas";
import { Button } from "@/sdui/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/sdui/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/sdui/ui/form";
import { Input } from "@/sdui/ui/input";
import { useToast } from "@/sdui/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { startOfDay } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";

const CreateLicenseDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateLicenseReq>({
    resolver: zodResolver(createLicenseReq),
    defaultValues: {
      app: "",
      validFrom: startOfDay(new Date()),
      quantity: 10,
      days: 31,
      totalActTimes: 1,
      rollingDays: 0,
    },
  });

  const { trigger, isMutating } = useSWRMutation(
    "/api/admin/license",
    createLicense
  );

  async function onSubmit(data: CreateLicenseReq) {
    const result = await trigger(data);
    if (result?.success) {
      form.reset();
      setOpen(false);
      toast({
        title: "License created",
        description: "License has been created.",
      });
    } else {
      toast({
        title: "License creation failed",
        description: "License creation failed.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create License</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  desc="The app for which the license is created."
                />
                <FormDatePicker
                  control={form.control}
                  name="validFrom"
                  label="Valid From"
                  desc="The date from which the license is able to be used."
                  placeholder="Pick a date"
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="quantity"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The number of licenses to be created.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="duration days"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The number of days the license is valid.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalActTimes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total activation times</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="total activation times"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The number of times the license can be use for
                        activation.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rollingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rolling days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="rolling days"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The number of days within verification code rolling.
                      </FormDescription>
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
  );
};

async function createLicense(_: string, { arg }: { arg: CreateLicenseReq }) {
  const res = await fetch("/api/admin/license", {
    method: "POST",
    body: JSON.stringify(arg),
  });
  const data = await res.json();
  return data;
}

export default CreateLicenseDialog;
