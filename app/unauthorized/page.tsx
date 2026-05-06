import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockKeyIcon, Home01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
            <HugeiconsIcon icon={LockKeyIcon} className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Không có quyền truy cập</CardTitle>
          <CardDescription className="text-base">
            Tài khoản của bạn không được phép mở trang này. Vui lòng đăng nhập bằng tài khoản khác có quyền cao hơn.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="default" size="lg" className="gap-2 rounded-2xl">
            <Link href="/login">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" /> Về đăng nhập
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 rounded-2xl">
            <Link href="/">
              <HugeiconsIcon icon={Home01Icon} className="h-4 w-4" /> Trang chủ
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
