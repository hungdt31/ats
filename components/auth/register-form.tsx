"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { registerSchema, type RegisterInput } from "../../lib/validators/auth";
import { useRegister } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const registerMutation = useRegister();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", fullName: "", phone: "" },
  });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    try {
      await registerMutation.mutateAsync(values);
      toast.success("Đăng ký thành công. Vui lòng đăng nhập.");
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors) {
          const fe = error.fieldErrors;
          if (fe.email?.[0]) form.setError("email", { message: fe.email[0] });
          if (fe.password?.[0]) form.setError("password", { message: fe.password[0] });
          if (fe.fullName?.[0]) form.setError("fullName", { message: fe.fullName[0] });
        }
        setServerError(error.message);
      } else {
        setServerError("Đăng ký thất bại");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {serverError ? (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="Nguyễn Văn A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="ban@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại (tuỳ chọn)</FormLabel>
              <FormControl>
                <Input type="tel" autoComplete="tel" {...field} value={field.value ?? ""} />
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
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Đang tạo tài khoản…" : "Đăng ký"}
        </Button>
      </form>
    </Form>
  );
}
