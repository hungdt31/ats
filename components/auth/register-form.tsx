"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { useRegister, useSendOtp } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();
  const sendOtpMutation = useSendOtp();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", fullName: "", phone: "" },
  });

  const isPending = registerMutation.isPending || sendOtpMutation.isPending;

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    try {
      await registerMutation.mutateAsync(values);

      if (verifyEmail) {
        await sendOtpMutation.mutateAsync({ email: values.email, type: "email_verify" });
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.");
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      } else {
        toast.success("Đăng ký thành công. Vui lòng đăng nhập.");
        router.push("/login");
      }
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                  >
                    <HugeiconsIcon
                      icon={showPassword ? ViewOffIcon : ViewIcon}
                      className="size-5"
                    />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tuỳ chọn xác minh email */}
        <label
          htmlFor="verify-email-checkbox"
          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/70 has-[button[data-state=checked]]:border-primary/40 has-[button[data-state=checked]]:bg-primary/5"
        >
          <Checkbox
            id="verify-email-checkbox"
            checked={verifyEmail}
            onCheckedChange={(checked) => setVerifyEmail(checked === true)}
            className="mt-0.5"
          />
          <span className="grid gap-0.5">
            <span className="text-sm font-medium leading-snug text-foreground">
              Xác minh email sau khi đăng ký
            </span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              Email đã xác minh giúp hệ thống gửi thông báo phỏng vấn, kết quả ứng tuyển và
              các email quan trọng khác đến bạn khi ứng tuyển.
            </span>
          </span>
        </label>

        <Button type="submit" className="w-full h-12" disabled={isPending}>
          {isPending ? "Đang xử lý…" : "Đăng ký"}
        </Button>
      </form>
    </Form>
  );
}
