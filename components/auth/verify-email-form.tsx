"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useVerifyEmail, useSendOtp } from "@/hooks/use-auth";
import { verifyEmailSchema, type VerifyEmailInput } from "@/lib/validators/auth";
import { ApiError } from "@/lib/api-client";
import { REGEXP_ONLY_DIGITS } from "input-otp";

/** Thời gian đếm ngược giữa 2 lần gửi lại (giây). */
const RESEND_COOLDOWN = 60;

interface VerifyEmailFormProps {
  email: string;
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const router = useRouter();
  const verifyMutation = useVerifyEmail();
  const sendOtpMutation = useSendOtp();

  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email, code: "" },
  });

  // Đếm ngược cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    setServerError(null);
    try {
      await sendOtpMutation.mutateAsync({ email, type: "email_verify" });
      toast.success("Đã gửi lại mã OTP, vui lòng kiểm tra email");
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError("Gửi lại mã thất bại");
      }
    }
  }, [email, sendOtpMutation]);

  async function onSubmit(values: VerifyEmailInput) {
    setServerError(null);
    try {
      await verifyMutation.mutateAsync(values);
      toast.success("Xác minh email thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          // Email đã được xác minh → chuyển thẳng sang login
          toast.info("Email của bạn đã được xác minh.");
          router.push("/login");
          return;
        }
        setServerError(error.message);
      } else {
        setServerError("Xác minh thất bại, vui lòng thử lại");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        {serverError ? (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center gap-2">
              <FormControl>
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={verifyMutation.isPending}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={verifyMutation.isPending || form.watch("code").length < 6}
        >
          {verifyMutation.isPending ? "Đang xác minh…" : "Xác minh email"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Không nhận được mã?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || sendOtpMutation.isPending}
            className="font-medium text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại mã"}
          </button>
        </p>
      </form>
    </Form>
  );
}
