import { redirect } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { email } = await searchParams;

  // Phải có email hợp lệ trong query string
  if (!email || !email.includes("@")) {
    redirect("/register");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Logo className="mb-6 justify-center" />
          <CardTitle>Xác minh email</CardTitle>
          <CardDescription>
            Chúng tôi đã gửi mã OTP 6 chữ số đến{" "}
            <span className="font-medium text-foreground">{email}</span>.
            <br />
            Nhập mã bên dưới để kích hoạt tài khoản.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <VerifyEmailForm email={email} />
          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
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
