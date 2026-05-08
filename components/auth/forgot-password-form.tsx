"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSendOtp } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";

const forgotSchema = z.object({
  email: z
    .email("Email không hợp lệ")
    .min(1, "Không được để trống email")
    .transform((v) => v.trim().toLowerCase()),
});

type ForgotInput = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const sendOtpMutation = useSendOtp();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotInput) {
    setServerError(null);
    try {
      await sendOtpMutation.mutateAsync({ email: values.email, type: "password_reset" });
      toast.success("Mã OTP đã được gửi, vui lòng kiểm tra email");
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        // Hiển thị thông điệp chung để tránh enumeration
        setServerError(error.message);
      } else {
        setServerError("Gửi yêu cầu thất bại, vui lòng thử lại");
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="ban@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={sendOtpMutation.isPending}>
          {sendOtpMutation.isPending ? "Đang gửi…" : "Gửi mã OTP"}
        </Button>
      </form>
    </Form>
  );
}
