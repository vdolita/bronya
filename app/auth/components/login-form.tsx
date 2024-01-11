"use client";

import { AuthCredential, authCredential } from "@/lib/schemas";
import { Button } from "@/sdui/ui/button";
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
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { login } from "../actions";

export default function LoginForm() {
  const { toast } = useToast();
  const [isPending, starTransition] = useTransition();

  const form = useForm<AuthCredential>({
    resolver: zodResolver(authCredential),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(data: AuthCredential) {
    starTransition(async () => {
      const res = await login(data);
      const err = res?.error;
      if (err) {
        toast({
          title: "Login Failed",
          description: err,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="w-96 h-fit">
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          className="space-y-8"
        >
          <FormField
            control={form.control}
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
            control={form.control}
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
  );
}
