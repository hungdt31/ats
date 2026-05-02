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
import type { MeResponse } from "@/types/api";

function isSafeRelativePath(path: string | null): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

function LoginFormFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Đăng nhập thất bại";
        setServerError(msg);
        return;
      }

      toast.success("Đăng nhập thành công");

      const callback = searchParams.get("callbackUrl");
      if (isSafeRelativePath(callback)) {
        router.push(callback);
        router.refresh();
        return;
      }

      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const meJson = (await meRes.json()) as MeResponse | { success: false };
      if (meRes.ok && meJson.success) {
        router.push(getPostLoginPath(meJson.data.user.role));
      } else {
        router.push("/candidate");
      }
      router.refresh();
    } finally {
      setSubmitting(false);
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

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
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
