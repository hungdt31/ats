import { redirect } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

interface ResetPasswordPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { email } = await searchParams;

  if (!email || !email.includes("@")) {
    redirect("/forgot-password");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Logo className="mb-6 justify-center" />
          <CardTitle>Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            Nhập mã OTP đã được gửi đến{" "}
            <span className="font-medium text-foreground">{email}</span>{" "}
            và mật khẩu mới của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ResetPasswordForm email={email} />
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/forgot-password"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Dùng email khác
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
