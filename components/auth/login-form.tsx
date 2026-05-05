"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { getPostLoginPath } from "@/lib/auth/redirects";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { useLogin } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";

function isSafeRelativePath(path: string | null): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

function LoginFormFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const loginMutation = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    try {
      const { me } = await loginMutation.mutateAsync(values);

      toast.success("Đăng nhập thành công");

      const callback = searchParams.get("callbackUrl");
      if (isSafeRelativePath(callback)) {
        router.push(callback);
        router.refresh();
        return;
      }

      if (me.success) {
        router.push(getPostLoginPath(me.data.user.role));
      } else {
        router.push("/candidate");
      }
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError("Đăng nhập thất bại");
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="ban@congty.com" {...field} />
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
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Mật khẩu</FormLabel>
              </div>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>

        <Separator />

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/register" className="underline-offset-2 hover:underline">
            Tạo tài khoản mới
          </Link>
        </p>
      </form>
    </Form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Đang tải form…</p>}>
      <LoginFormFields />
    </Suspense>
  );
}
