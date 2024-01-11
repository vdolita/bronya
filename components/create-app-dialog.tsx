"use client";

import { createApp } from "@/app/_fetcher/app";
import { CreateAppReq, createAppReq } from "@/lib/schemas/app-req";
import { Button } from "@/sdui/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/sdui/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/sdui/ui/form";
import { Input } from "@/sdui/ui/input";
import { useToast } from "@/sdui/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";

const CreateAppDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateAppReq>({
    resolver: zodResolver(createAppReq),
    defaultValues: {
      name: "",
    },
  });

  const { trigger, isMutating } = useSWRMutation("/api/admin/app", createApp);

  async function onSubmit(data: CreateAppReq) {
    const result = await trigger(data);
    if (result?.success) {
      form.reset();
      setOpen(false);
      toast({
        title: "App created",
        description: "App has been created.",
      });
    } else {
      toast({
        title: "App creation failed",
        description: "App creation failed.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create App</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}>
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Create new app</DialogTitle>
              </DialogHeader>
              <FormField
                control={form.control}
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
              <DialogFooter>
                <Button type="submit" disabled={isMutating}>
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

export default CreateAppDialog;
