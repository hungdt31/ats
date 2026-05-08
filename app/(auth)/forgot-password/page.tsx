import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Logo className="mb-6 justify-center" />
          <CardTitle>Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập địa chỉ email đã đăng ký, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ForgotPasswordForm />
          <p className="text-center text-sm text-muted-foreground">
            Nhớ mật khẩu rồi?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
